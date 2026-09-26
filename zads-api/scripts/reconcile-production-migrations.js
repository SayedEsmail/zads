// One-time additive reconciliation for the two September 2026 migrations.
// Never run automatically: invoked only by ZADS_DB_TASK=reconcile in a controlled build.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { Client } = require('pg');
const names = ['20260926160000_complete_platform_contracts', '20260926170000_contact_idempotency_and_analytics_funnel'];
async function reconcile() {
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, connectionTimeoutMillis: 15000 });
  try {
    await client.connect();
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SET LOCAL statement_timeout = '60s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('zads-september-2026-migrations'))");
    const counts = async () => {
      const result = {};
      for (const table of ['teachers', 'parents', 'parent_children', 'teacher_subjects', 'contact_requests', 'tutor_requests', 'teacher_availabilities']) {
        const exists = await client.query('SELECT to_regclass($1) AS relation', [`public.${table}`]);
        if (exists.rows[0].relation) result[table] = (await client.query(`SELECT COUNT(*)::int AS count FROM "${table}"`)).rows[0].count;
      }
      return result;
    };
    const before = await counts();
    for (const name of names) {
      const applied = await client.query('SELECT finished_at FROM _prisma_migrations WHERE migration_name=$1 AND rolled_back_at IS NULL', [name]);
      if (applied.rows.some(row => row.finished_at)) continue;
      if (applied.rows.length) throw new Error('Unresolved failed migration: ' + name);
      const sql = fs.readFileSync(path.join(__dirname, '../prisma/migrations', name, 'migration.sql'), 'utf8');
      const statements = sql.replace(/--[^\n]*/g, '').split(';').map(s => s.trim()).filter(Boolean);
      let onlineAdded = false;
      for (const statement of statements) {
        const column = statement.match(/^ALTER TABLE "(\w+)" ADD COLUMN "(\w+)" (.+)$/s);
        if (column) {
          const existing = await client.query('SELECT data_type, udt_name FROM information_schema.columns WHERE table_schema=\'public\' AND table_name=$1 AND column_name=$2', [column[1], column[2]]);
          if (existing.rows.length) {
            const type = column[3].split(/\s+/)[0];
            const expected = { TEXT: 'text', BOOLEAN: 'bool', INTEGER: 'int4', 'TIMESTAMP(3)': 'timestamp', '"StudyMode"': 'StudyMode' }[type];
            if (!expected || existing.rows[0].udt_name !== expected) throw new Error('Unexpected column type: ' + column[1] + '.' + column[2]);
            continue;
          }
          if (column[1] === 'teacher_subjects' && column[2] === 'is_online') onlineAdded = true;
        }
        if (statement.startsWith('UPDATE "teacher_subjects"') && !onlineAdded) continue;
        const table = statement.match(/^CREATE TABLE "(\w+)"/);
        if (table) {
          const exists = await client.query('SELECT to_regclass($1) AS relation', [`public.${table[1]}`]);
          if (exists.rows[0].relation) {
            const columns = await client.query('SELECT column_name FROM information_schema.columns WHERE table_schema=\'public\' AND table_name=$1', [table[1]]);
            for (const field of statement.matchAll(/^\s*"(\w+)" /gm)) {
              if (!columns.rows.some(row => row.column_name === field[1])) throw new Error('Existing table missing field: ' + table[1] + '.' + field[1]);
            }
            continue;
          }
        }
        const index = statement.match(/^CREATE (?:UNIQUE )?INDEX(?: IF NOT EXISTS)? "(\w+)"/);
        if (index) {
          const exists = await client.query('SELECT to_regclass($1) AS relation', [`public.${index[1]}`]);
          if (exists.rows[0].relation) continue;
        }
        const constraint = statement.match(/^ALTER TABLE "(\w+)" ADD CONSTRAINT "(\w+)"/);
        if (constraint) {
          const exists = await client.query('SELECT 1 FROM pg_constraint WHERE conrelid=to_regclass($1) AND conname=$2', [`public.${constraint[1]}`, constraint[2]]);
          if (exists.rows.length) continue;
        }
        await client.query(statement);
      }
    }
    const after = await counts();
    for (const [table, count] of Object.entries(before)) {
      if (after[table] !== count) throw new Error('Unexpected row count change: ' + table);
    }
    console.log('ZADS_RECONCILE_COUNTS_PRESERVED', JSON.stringify(before));
    await client.query('COMMIT');
    for (const name of names) {
      const applied = await client.query('SELECT 1 FROM _prisma_migrations WHERE migration_name=$1 AND finished_at IS NOT NULL AND rolled_back_at IS NULL', [name]);
      if (applied.rows.length) continue;
      const result = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'resolve', '--applied', name], { cwd: path.join(__dirname, '..'), env: process.env, encoding: 'utf8' });
      if (result.status !== 0) throw new Error('Schema applied; migration recording failed: ' + name);
      console.log('ZADS_MIGRATION_RECORDED', name);
    }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { await client.end(); }
}
module.exports = reconcile;
