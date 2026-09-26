// Run mutating API integration tests only against a disposable local database.
const { default: EmbeddedPostgres } = require('embedded-postgres');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');

async function run(command, args, env) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: path.resolve(__dirname, '..'), env });
    let output = '';
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { output += data; });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        console.log(`PASS: ${args.join(' ')}`);
        resolve();
      } else {
        // Do not print query-string credentials even for test identities.
        console.error(output.replace(/([?&]token=)[^\s"&]+/g, '$1[REDACTED]'));
        reject(new Error(`Test command exited ${code}: ${args.join(' ')}`));
      }
    });
  });
}

(async () => {
  const reservation = net.createServer();
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'zads-tests-'));
  const postgres = new EmbeddedPostgres({ databaseDir: directory, port, user: 'review', password: 'local-tests-only', persistent: false, onLog: () => {}, onError: () => {} });
  const databaseUrl = `postgresql://review:local-tests-only@127.0.0.1:${port}/postgres?schema=public`;
  const env = {
    ...process.env,
    NODE_ENV: 'test', DATABASE_URL: databaseUrl, DIRECT_URL: databaseUrl,
    JWT_SECRET: 'isolated-tests-only-secret',
    GOOGLE_APPLICATION_CREDENTIALS: path.join(directory, 'unconfigured-firebase.json'),
  };
  let started = false;
  try {
    await postgres.initialise();
    await postgres.start();
    started = true;
    await run(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'], env);
    for (const test of ['e2e-complete-flow.test.js', 'z03-admin-contracts.test.js', 'z04-z08-privacy-contracts.test.js']) {
      await run(process.execPath, [`tests/${test}`], env);
    }
  } finally {
    if (started) await postgres.stop();
    fs.rmSync(directory, { recursive: true, force: true });
  }
})().catch(error => { console.error(error.message); process.exit(1); });
