// Explicit operational check: existing accounts, short-lived tokens, GET allowlist only.
// Tokens and response bodies must never be written to build logs.
const { Client } = require('pg');
const jwt = require('jsonwebtoken');
async function main() {
  if (process.env.ZADS_READ_CHECK !== '1') return;
  if (!process.env.JWT_SECRET) throw new Error('Missing signing configuration');
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, connectionTimeoutMillis: 15000 });
  let accounts;
  try {
    await client.connect();
    await client.query('BEGIN READ ONLY');
    accounts = (await client.query("SELECT DISTINCT ON (user_type) id, user_type FROM users WHERE status='active' ORDER BY user_type, created_at")).rows;
    await client.query('ROLLBACK');
  } finally { await client.end(); }
  const routes = {
    parent: ['/parents/me', '/parents/me/children', '/contact-requests/my', '/tutor-requests/my'],
    teacher: ['/teachers/me', '/teachers/me/subjects', '/teachers/me/availability', '/teachers/me/stats', '/contact-requests/incoming', '/tutor-requests'],
    admin: ['/admin/dashboard', '/admin/teachers', '/admin/parents', '/admin/contact-requests'],
  };
  for (const [role, paths] of Object.entries(routes)) {
    const account = accounts.find(user => user.user_type === role);
    if (!account) throw new Error('No active account for role: ' + role);
    const token = jwt.sign({ userId: account.id, userType: role }, process.env.JWT_SECRET, { expiresIn: '5m' });
    for (const origin of ['https://api.zads.app', 'https://zads.app']) {
      for (const path of paths) {
        const response = await fetch(origin + '/api' + path, {
          headers: { Authorization: `Bearer ${token}` }, redirect: 'error', signal: AbortSignal.timeout(20000),
        });
        if (response.status !== 200) throw new Error(`Read check failed: ${origin}${path} status=${response.status}`);
        const body = await response.json();
        if (!body.success) throw new Error('Unsuccessful response: ' + path);
        if (path === '/admin/contact-requests' && (!Array.isArray(body.data) || typeof body.pagination?.total !== 'number')) {
          throw new Error('Invalid admin contact pagination contract');
        }
        console.log('ZADS_READ_CHECK_PASS', role, origin, path, response.status);
      }
    }
  }
}
main().catch(error => { console.error('ZADS_READ_CHECK_FAILED', error.message); process.exitCode = 1; });
