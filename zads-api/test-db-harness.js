const { default: EmbeddedPostgres } = require('embedded-postgres');
const { Client } = require('pg');
const path = require('path');

const DB_DIR = path.resolve(__dirname, '.test-pgdata');
const PORT = 5433;
const USER = 'testuser';
const PASSWORD = 'testpassword';
const DBNAME = 'moalemy_test';

const pg = new EmbeddedPostgres({
  port: PORT,
  databaseDir: DB_DIR,
  user: USER,
  password: PASSWORD,
  persistent: true,
});

const fs = require('fs');

async function start() {
  const versionFile = path.join(DB_DIR, 'PG_VERSION');
  if (!fs.existsSync(versionFile)) {
    await pg.initialise();
  }
  await pg.start();
  // Ensure database exists
  const client = new Client({
    host: '127.0.0.1',
    port: PORT,
    user: USER,
    password: PASSWORD,
    database: 'postgres',
  });
  await client.connect();
  const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${DBNAME}'`);
  if (res.rowCount === 0) {
    await client.query(`CREATE DATABASE "${DBNAME}"`);
  }
  await client.end();
  console.log(`Test Postgres ready on port ${PORT}, db: ${DBNAME}`);
}

async function stop() {
  await pg.stop();
  console.log('Test Postgres stopped.');
}

if (require.main === module) {
  const cmd = process.argv[2] || 'start';
  if (cmd === 'start') {
    start().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  } else if (cmd === 'stop') {
    stop().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
}

module.exports = { start, stop, PORT, USER, PASSWORD, DBNAME };
