const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relative, overrides = {}) {
  const filename = path.resolve(__dirname, '..', relative);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  vm.runInThisContext(`(function(require, module, exports, process) {${source}\n})`, { filename })(
    (name) => overrides[name] ?? require(name), module, module.exports, process,
  );
  return module.exports;
}

(async () => {
  let sessionCalls = 0;
  const api = load('src/lib/api.ts', {
    'next-auth/react': {
      getSession: async () => { sessionCalls++; throw new Error('Session unavailable'); },
      signOut: async () => { throw new Error('Public discovery must not sign out'); },
    },
  });
  const teacher = { id: 'public-teacher', user: { name: 'Teacher' } };
  api.publicApi.defaults.adapter = async (config) => {
    assert.equal(config.headers.Authorization, undefined);
    return { status: 200, statusText: 'OK', headers: {}, config,
      data: { data: [teacher], pagination: { total: 1, totalPages: 1 } } };
  };
  const { useSearchStore } = load('src/stores/search.ts', {
    '@/lib/api': api,
    './_convention': { extractError: (error) => error.message },
  });
  await useSearchStore.getState().searchTeachers({}, true);
  assert.equal(sessionCalls, 0);
  assert.equal(useSearchStore.getState().teachers.length, 1);
  assert.equal(useSearchStore.getState().totalTeachers, 1);
  assert.equal(useSearchStore.getState().error, null);

  api.publicApi.defaults.adapter = async () => { throw new Error('Network unavailable'); };
  await useSearchStore.getState().searchTeachers({}, true);
  assert.equal(useSearchStore.getState().error, 'Network unavailable');
  assert.equal(useSearchStore.getState().isLoadingTeachers, false);

  await useSearchStore.getState().searchTeachers({});
  assert.equal(sessionCalls, 1, 'Account discovery still uses the authenticated client');
  const React = require('react');
  const { renderToString } = require('react-dom/server');
  const { default: Page } = load('src/app/[locale]/public/teachers/page.tsx', {
    'next-intl': { useLocale: () => 'ar' },
    'next/link': ({ children, href }) => React.createElement('a', { href }, children),
    '@/stores/search': { useSearchStore },
    '@/components/shared/TeacherCard': { TeacherCard: () => null },
    '@/components/shared/PageSkeleton': { PageSkeleton: () => React.createElement('div', null, 'loading-marker') },
    '@/components/shared/ErrorBanner': { ErrorBanner: () => null },
  });
  const html = renderToString(React.createElement(Page));
  assert.ok(html.includes('loading-marker'), 'Initial render must show loading before effects run');
  assert.ok(!html.includes('عرض 0'), 'Initial render must not claim there are no teachers');
  console.log('PASS public discovery: anonymous results, session independence, retryable errors, authenticated account search');
})().catch((error) => { console.error(error); process.exitCode = 1; });
