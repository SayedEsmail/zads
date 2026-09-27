// Integration suites create and mutate fixtures. Never inherit a production .env URL.
const databaseUrl = process.env.DATABASE_URL;
if (process.env.NODE_ENV !== 'test' || !databaseUrl) {
  throw new Error('Integration tests require NODE_ENV=test and an explicit local DATABASE_URL');
}
const parsed = new URL(databaseUrl);
if (!['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)) {
  throw new Error('Integration tests must use an isolated local PostgreSQL database');
}
