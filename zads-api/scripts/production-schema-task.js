// Explicit, build-time schema inspection. No database work on ordinary builds.
const { Client } = require('pg');
async function main() {
  if (!['audit', 'reconcile'].includes(process.env.ZADS_DB_TASK)) return;
  if (process.env.ZADS_DB_TASK === 'reconcile') await require('./reconcile-production-migrations')();
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, connectionTimeoutMillis: 15000 });
  try {
    await client.connect();
    await client.query('BEGIN READ ONLY');
    const migrations = await client.query('SELECT migration_name, finished_at IS NOT NULL AS applied, rolled_back_at IS NOT NULL AS rolled_back FROM "_prisma_migrations" ORDER BY started_at');
    const columns = await client.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position");
    console.log('ZADS_MIGRATIONS', JSON.stringify(migrations.rows));
    for (const table of ['teachers','teacher_subjects','parent_children','contact_requests','teacher_availabilities','platform_events']) {
      console.log('ZADS_COLUMNS',table,JSON.stringify(columns.rows.filter(row => row.table_name === table).map(row => row.column_name)));
    }
    const constraints = await client.query("SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename IN ('contact_requests','teacher_availabilities','platform_events')");
    console.log('ZADS_INDEXES',JSON.stringify(constraints.rows));
    const duplicates = await client.query("SELECT COUNT(*)::int AS groups FROM (SELECT 1 FROM contact_requests WHERE status='pending' GROUP BY parent_id,teacher_id,COALESCE(subject_id,'00000000-0000-0000-0000-000000000000') HAVING COUNT(*) > 1) d");
    console.log('ZADS_PENDING_DUPLICATES',JSON.stringify(duplicates.rows));
    await client.query('ROLLBACK');
  } finally { await client.end(); }
}
main().catch(error => { console.error('Schema audit failed', error.code || error.name); process.exitCode = 1; });
