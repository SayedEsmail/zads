// Disposable API for the zads-app Playwright suite (same idea as test-local.js).
// TEST_DATABASE_URL: an empty, throw-away local database (CI: postgres:16
// service container). Without it an embedded Postgres is started and deleted
// on exit. Then: migrate deploy → base seed → demo teachers → serve the API on
// 127.0.0.1:E2E_API_PORT (default 3100). Seeded fixture ids are written to
// E2E_FIXTURES_FILE so the browser tests can find them.
const { spawn } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.E2E_API_PORT || 3100);

function run(args, env) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, args, { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
        let output = '';
        child.stdout.on('data', (d) => { output += d; });
        child.stderr.on('data', (d) => { output += d; });
        child.on('error', reject);
        child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${args.join(' ')} exited ${code}\n${output}`))));
    });
}

async function freePort() {
    const s = net.createServer();
    await new Promise((r) => s.listen(0, '127.0.0.1', r));
    const { port } = s.address();
    await new Promise((r) => s.close(r));
    return port;
}

function listen(app, port) {
    return new Promise((resolve, reject) => {
        const server = app.listen(port, '127.0.0.1', () => resolve(server));
        server.on('error', reject);
    });
}

(async () => {
    const cleanups = [];
    const cleanup = async () => {
        for (const fn of cleanups.reverse()) await fn().catch(() => {});
    };
    for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => cleanup().finally(() => process.exit(0)));

    let databaseUrl = process.env.TEST_DATABASE_URL;
    if (!databaseUrl) {
        const { default: EmbeddedPostgres } = require('embedded-postgres');
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'zads-e2e-'));
        const port = await freePort();
        const pg = new EmbeddedPostgres({ databaseDir: dir, port, user: 'e2e', password: 'local-tests-only', persistent: false, onLog: () => {}, onError: () => {} });
        await pg.initialise();
        await pg.start();
        cleanups.push(async () => { await pg.stop(); fs.rmSync(dir, { recursive: true, force: true }); });
        databaseUrl = `postgresql://e2e:local-tests-only@127.0.0.1:${port}/postgres?schema=public`;
    }
    if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(databaseUrl).hostname)) {
        throw new Error('e2e-server: TEST_DATABASE_URL must point at a disposable local database');
    }

    Object.assign(process.env, {
        NODE_ENV: 'test',
        DATABASE_URL: databaseUrl,
        DIRECT_URL: databaseUrl,
        JWT_SECRET: crypto.randomBytes(32).toString('hex'),
        FIREBASE_SERVICE_ACCOUNT_JSON: '',
        GOOGLE_APPLICATION_CREDENTIALS: path.join(os.tmpdir(), 'zads-e2e-no-firebase.json'),
    });

    await run([require.resolve('prisma/build/index.js'), 'migrate', 'deploy'], process.env);
    await run([path.join(ROOT, 'prisma', 'seed.js')], process.env);

    const app = require(path.join(ROOT, 'src', 'app.js'));
    const { seedDemo } = require('./seed-demo');

    // Seed on a private port first so the public port only answers once fixtures exist.
    const seeding = await listen(app, 0);
    const fixtures = await seedDemo(`http://127.0.0.1:${seeding.address().port}`);
    await new Promise((r) => { seeding.close(r); seeding.closeAllConnections(); });

    if (process.env.E2E_FIXTURES_FILE) {
        fs.mkdirSync(path.dirname(process.env.E2E_FIXTURES_FILE), { recursive: true });
        fs.writeFileSync(process.env.E2E_FIXTURES_FILE, JSON.stringify({ teachers: fixtures }, null, 2));
    }

    const server = await listen(app, PORT);
    cleanups.push(() => new Promise((r) => server.close(r)));
    console.log(`e2e-server: API ready on http://127.0.0.1:${PORT}`);
})().catch((err) => { console.error(err.message); process.exit(1); });
