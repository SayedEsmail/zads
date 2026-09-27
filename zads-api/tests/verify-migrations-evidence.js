const { Client } = require('pg');
const { execSync } = require('child_process');

const PG_HOST = '127.0.0.1';
const PG_PORT = 5433;
const PG_USER = 'testuser';
const PG_PASS = 'testpassword';

async function run() {
  console.log('=== [MIGRATION EVIDENCE VERIFICATION] ===\n');
  const adminClient = new Client({
    connectionString: `postgresql://${PG_USER}:${PG_PASS}@${PG_HOST}:${PG_PORT}/postgres`
  });
  await adminClient.connect();

  // ----------------------------------------------------
  // TEST 1: FRESH DATABASE DEPLOYMENT
  // ----------------------------------------------------
  console.log('--- TEST 1: Fresh Database Migration ---');
  await adminClient.query('DROP DATABASE IF EXISTS moalemy_fresh_test;');
  await adminClient.query('CREATE DATABASE moalemy_fresh_test;');
  console.log('Created fresh empty database: moalemy_fresh_test');

  const freshDbUrl = `postgresql://${PG_USER}:${PG_PASS}@${PG_HOST}:${PG_PORT}/moalemy_fresh_test?schema=public`;

  try {
    const deployOut = execSync(
      `pnpm prisma migrate deploy`,
      {
        cwd: __dirname + '/..',
        env: {
          ...process.env,
          DATABASE_URL: freshDbUrl,
          DIRECT_URL: freshDbUrl
        },
        encoding: 'utf8'
      }
    );
    console.log('prisma migrate deploy output on fresh DB:');
    console.log(deployOut.trim());
  } catch (err) {
    console.error('Fresh DB migration deploy failed:', err.stdout || err.message);
    process.exit(1);
  }

  // Verify tables in fresh database
  const freshClient = new Client({ connectionString: freshDbUrl });
  await freshClient.connect();
  const tablesRes = await freshClient.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  console.log(`\nFresh DB created ${tablesRes.rows.length} tables:`, tablesRes.rows.map(r => r.table_name));

  // Check critical columns & constraints in fresh DB
  const freshCols = await freshClient.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'contact_requests' AND column_name IN ('idempotency_key', 'initiated_by', 'study_mode', 'tutor_request_id');
  `);
  console.log('Contact requests schema in fresh DB:', freshCols.rows);
  await freshClient.end();

  console.log('✅ TEST 1 PASSED: Fresh database migration deployed cleanly without error.\n');

  // ----------------------------------------------------
  // TEST 2: UPGRADED DATABASE WITH PRE-EXISTING DATA (UPGRADE FROM OLDER SCHEMA)
  // ----------------------------------------------------
  console.log('--- TEST 2: True Schema Upgrade from Older Baseline Schema ---');
  await adminClient.query('DROP DATABASE IF EXISTS moalemy_upgraded_test;');
  await adminClient.query('CREATE DATABASE moalemy_upgraded_test;');
  console.log('Created database for upgrade test: moalemy_upgraded_test');

  const upgradedDbUrl = `postgresql://${PG_USER}:${PG_PASS}@${PG_HOST}:${PG_PORT}/moalemy_upgraded_test?schema=public`;
  const upgradedClient = new Client({ connectionString: upgradedDbUrl });
  await upgradedClient.connect();

  // Create Prisma migrations table to simulate an existing older database
  await upgradedClient.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id"                    VARCHAR(36) PRIMARY KEY NOT NULL,
        "checksum"              VARCHAR(64) NOT NULL,
        "finished_at"           TIMESTAMPTZ,
        "migration_name"        VARCHAR(255) NOT NULL,
        "logs"                  TEXT,
        "rolled_back_at"        TIMESTAMPTZ,
        "started_at"            TIMESTAMPTZ NOT NULL DEFAULT now(),
        "applied_steps_count"   INTEGER NOT NULL DEFAULT 0
    );
  `);

  const crypto = require('crypto');
  const fs = require('fs');
  const path = require('path');

  // The 6 historical migrations prior to our platform upgrade
  const HISTORICAL_MIGRATIONS = [
    '20251226124027_zads',
    '20251227021545_add_locations',
    '20251227104301_add_parent_children',
    '20251227113221_add_tutor_request_area',
    '20260425000000_platform_evolution_client_study_mode',
    '20260518194436_init'
  ];

  console.log('Applying 6 pre-audit baseline migrations to establish older schema...');
  for (const migName of HISTORICAL_MIGRATIONS) {
    const migSqlPath = path.join(__dirname, '../prisma/migrations', migName, 'migration.sql');
    const sqlContent = fs.readFileSync(migSqlPath, 'utf8');
    const checksum = crypto.createHash('sha256').update(fs.readFileSync(migSqlPath)).digest('hex');

    // Execute SQL directly on the old database
    await upgradedClient.query(sqlContent);

    // Record in _prisma_migrations as already applied
    await upgradedClient.query(`
      INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
      VALUES ($1, $2, NOW(), $3, NULL, NULL, NOW(), 1)
    `, [crypto.randomUUID(), checksum, migName]);
  }

  // Verify that in this OLD schema, the new columns and tables DO NOT exist yet!
  const preCheckCols = await upgradedClient.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'contact_requests' AND column_name IN ('initiated_by', 'tutor_request_id', 'idempotency_key');
  `);
  console.log(`Verified older schema state: new contact_requests columns present before upgrade = ${preCheckCols.rows.length} (expected 0)`);
  if (preCheckCols.rows.length !== 0) {
    throw new Error('Baseline schema unexpectedly has new columns!');
  }

  const preCheckPlatformEvents = await upgradedClient.query(`
    SELECT table_name FROM information_schema.tables WHERE table_name = 'platform_events';
  `);
  console.log(`Verified older schema state: platform_events table exists before upgrade = ${preCheckPlatformEvents.rows.length} (expected 0)`);
  if (preCheckPlatformEvents.rows.length !== 0) {
    throw new Error('Baseline schema unexpectedly has platform_events table!');
  }

  // Insert real historical rows into the OLD schema
  console.log('Inserting historical records into older schema baseline...');
  await upgradedClient.query(`
    INSERT INTO users (id, phone, password_hash, name, user_type, status, created_at, updated_at)
    VALUES ('u-hist-1', '01011112222', 'hash123', 'Historical Teacher User', 'teacher', 'active', NOW(), NOW());

    INSERT INTO teachers (id, user_id, bio, experience_years, qualification, views_count, is_verified, created_at, updated_at)
    VALUES ('t-hist-1', 'u-hist-1', 'Historical teacher bio from v1', 5, 'BSc Education', 10, false, NOW(), NOW());

    INSERT INTO users (id, phone, password_hash, name, user_type, status, created_at, updated_at)
    VALUES ('u-hist-2', '01033334444', 'hash123', 'Historical Parent User', 'parent', 'active', NOW(), NOW());

    INSERT INTO parents (id, user_id, created_at, updated_at)
    VALUES ('p-hist-1', 'u-hist-2', NOW(), NOW());

    -- Note: Older contact_requests table has NO initiated_by, NO tutor_request_id, NO idempotency_key
    INSERT INTO contact_requests (id, parent_id, teacher_id, status, created_at, updated_at)
    VALUES ('cr-hist-1', 'p-hist-1', 't-hist-1', 'pending', NOW(), NOW());
  `);
  console.log('Successfully seeded older schema with historical records.');

  // NOW RUN PRISMA MIGRATE DEPLOY TO UPGRADE TO THE NEW SCHEMA!
  console.log('\nRunning prisma migrate deploy to apply new migrations onto older database...');
  try {
    const upgradeOut = execSync(
      `pnpm prisma migrate deploy`,
      {
        cwd: __dirname + '/..',
        env: {
          ...process.env,
          DATABASE_URL: upgradedDbUrl,
          DIRECT_URL: upgradedDbUrl
        },
        encoding: 'utf8'
      }
    );
    console.log('prisma migrate deploy output during upgrade:');
    console.log(upgradeOut.trim());
  } catch (err) {
    console.error('Migration upgrade failed:', err.stdout || err.message);
    process.exit(1);
  }

  // VERIFY UPGRADE SUCCESS & HISTORICAL DATA INTEGRITY
  // 1. Check that platform_events now exists
  const postEventsCheck = await upgradedClient.query(`
    SELECT table_name FROM information_schema.tables WHERE table_name = 'platform_events';
  `);
  if (postEventsCheck.rows.length !== 1) {
    throw new Error('platform_events table was not created during upgrade!');
  }
  console.log('Verified: platform_events table created during upgrade.');

  // 2. Check that teachers has new columns and historical row was preserved
  const checkTeacher = await upgradedClient.query(`
    SELECT id, bio, certificate_url, verified_at, verified_by 
    FROM teachers WHERE id = 't-hist-1'
  `);
  if (checkTeacher.rows.length !== 1) {
    throw new Error('Historical teacher record was lost during upgrade!');
  }
  console.log('Historical teacher row preserved with upgraded nullable columns:', checkTeacher.rows[0]);

  // 3. Check that contact_requests has new columns and historical row received defaults
  const checkContact = await upgradedClient.query(`
    SELECT id, initiated_by, status, idempotency_key, tutor_request_id, study_mode 
    FROM contact_requests WHERE id = 'cr-hist-1'
  `);
  if (checkContact.rows.length !== 1) {
    throw new Error('Historical contact request record was lost during upgrade!');
  }
  console.log('Historical contact request row preserved with upgraded columns:', checkContact.rows[0]);

  if (checkContact.rows[0].initiated_by !== 'parent') {
    throw new Error('Historical contact request did not receive expected default initiated_by');
  }

  console.log('✅ TEST 2 PASSED: Genuine schema upgrade verified from older database. Historical rows preserved, schema backward-compatible.');

  await upgradedClient.end();
  await adminClient.end();
  console.log('\n=== ALL MIGRATION TESTS PASSED SUCCESSFULLY ===');
}

run().catch(err => {
  console.error('Migration verification script error:', err);
  process.exit(1);
});
