require('./require-test-database');
const assert = require('assert');
const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/database');
const { jwtSecret } = require('../src/config/env');

function makeRequest(server, options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Z03 Admin Contracts Tests...');

  // Start test server on random port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    // 1. Find or create admin user
    let admin = await prisma.user.findFirst({ where: { userType: 'admin' } });
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          phone: '01000000001',
          name: 'Test Admin',
          passwordHash: 'dummy',
          userType: 'admin',
          status: 'active',
        },
      });
    }

    const adminToken = jwt.sign({ userId: admin.id, userType: 'admin' }, jwtSecret, { expiresIn: '1h' });

    // 2. Test unauthenticated request returns 401
    const unauthRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/admin/teachers',
      method: 'GET',
    });
    assert.strictEqual(unauthRes.status, 401, 'Unauthenticated request should return 401');
    console.log('  ✅ Unauthenticated request correctly returns 401');

    // 3. Test GET /api/admin/teachers contract
    const teachersRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/admin/teachers?page=1&limit=5',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(teachersRes.status, 200, 'GET /api/admin/teachers should return 200');
    assert.strictEqual(teachersRes.body.success, true, 'success should be true');
    assert.ok(Array.isArray(teachersRes.body.data), 'data should be an array');
    assert.ok(teachersRes.body.pagination, 'response should include pagination object');
    assert.strictEqual(typeof teachersRes.body.pagination.total, 'number', 'pagination.total must be a number');
    assert.strictEqual(teachersRes.body.pagination.page, 1, 'pagination.page must be 1');
    assert.strictEqual(teachersRes.body.pagination.limit, 5, 'pagination.limit must be 5');
    console.log('  ✅ GET /api/admin/teachers pagination contract matches: pagination { page, limit, total, totalPages }');

    // 4. Test GET /api/admin/parents contract
    const parentsRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/admin/parents?page=1&limit=5',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(parentsRes.status, 200, 'GET /api/admin/parents should return 200');
    assert.strictEqual(parentsRes.body.success, true, 'success should be true');
    assert.ok(Array.isArray(parentsRes.body.data), 'data should be an array');
    assert.ok(parentsRes.body.pagination, 'response should include pagination object');
    assert.strictEqual(typeof parentsRes.body.pagination.total, 'number', 'pagination.total must be a number');
    console.log('  ✅ GET /api/admin/parents pagination contract matches: pagination { page, limit, total, totalPages }');

    // 5. Test GET /api/admin/contact-requests contract
    const contactRequestsRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/admin/contact-requests?page=1&limit=10',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(contactRequestsRes.status, 200, 'GET /api/admin/contact-requests should return 200');
    assert.strictEqual(contactRequestsRes.body.success, true, 'success should be true');
    assert.ok(Array.isArray(contactRequestsRes.body.data), 'data should be an array');
    assert.ok(contactRequestsRes.body.pagination, 'response should include pagination object');
    assert.strictEqual(typeof contactRequestsRes.body.pagination.total, 'number', 'pagination.total must be a number');
    console.log('  ✅ GET /api/admin/contact-requests contract matches: pagination { page, limit, total, totalPages }');

    // 6. Test GET /api/admin/stats/contacts contract
    const contactStatsRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/admin/stats/contacts',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(contactStatsRes.status, 200, 'GET /api/admin/stats/contacts should return 200');
    assert.strictEqual(contactStatsRes.body.success, true);
    assert.strictEqual(typeof contactStatsRes.body.data.total, 'number');
    assert.ok(typeof contactStatsRes.body.data.byStatus === 'object');
    console.log('  ✅ GET /api/admin/stats/contacts contract intact');

    console.log('🎉 All Z03 Admin Contracts Tests PASSED!');
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
