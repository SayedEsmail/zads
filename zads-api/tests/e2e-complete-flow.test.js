const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/database');
const { jwtSecret } = require('../src/config/env');

function makeRequest(port, method, reqPath, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: '127.0.0.1',
      port,
      method,
      path: reqPath,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: json, text: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, text: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runSuite() {
  console.log('🚀 [E2E INTEGRATION & SECURITY TEST SUITE]\n');

  const server = http.createServer(app);
  await new Promise(res => server.listen(0, '127.0.0.1', res));
  const port = server.address().port;
  console.log(`Test server bound to ephemeral port: ${port}`);

  let testTeacherUser, testTeacher, testTeacherToken;
  let testOtherTeacherUser, testOtherTeacher, testOtherTeacherToken;
  let testParentUser, testParent, testParentToken;
  let testAdminUser, testAdminToken;
  let testSubject, testStage, testArea, testCity, testGov;
  let testCertFilename;

  try {
    // ----------------------------------------------------
    // SETUP FIXTURES
    // ----------------------------------------------------
    testGov = await prisma.governorate.upsert({
      where: { id: 'gov-e2e-auto' },
      update: {},
      create: { id: 'gov-e2e-auto', nameAr: 'الجيزة', nameEn: 'Giza' }
    });

    testCity = await prisma.city.upsert({
      where: { id: 'city-e2e-auto' },
      update: {},
      create: { id: 'city-e2e-auto', nameAr: 'السادس من أكتوبر', nameEn: '6th of October', governorateId: testGov.id }
    });

    testArea = await prisma.area.upsert({
      where: { id: 'area-e2e-auto' },
      update: {},
      create: { id: 'area-e2e-auto', nameAr: 'الحي المتميز', nameEn: 'Al Motamayez', cityId: testCity.id }
    });

    testStage = await prisma.stage.upsert({
      where: { id: 'stage-e2e-auto' },
      update: {},
      create: { id: 'stage-e2e-auto', nameAr: 'المرحلة الإعدادية', nameEn: 'Preparatory', sortOrder: 2 }
    });

    testSubject = await prisma.subject.upsert({
      where: { id: 'subj-e2e-auto' },
      update: {},
      create: { id: 'subj-e2e-auto', nameAr: 'رياضيات', nameEn: 'Math', icon: 'calculator' }
    });

    // Cleanup previous runs
    await prisma.user.deleteMany({
      where: { phone: { in: ['01011119001', '01011119002', '01055559999', '01099999999'] } }
    });

    const hash = await bcrypt.hash('Password123', 10);

    // Create Teacher 1 with Certificate file
    testTeacherUser = await prisma.user.create({
      data: {
        phone: '01011119001',
        passwordHash: hash,
        name: 'الأستاذ خالد المنشاوي',
        userType: 'teacher',
        status: 'active'
      }
    });

    testCertFilename = `cert-test-${Date.now()}.pdf`;
    const certDir = path.resolve('public/uploads/certificates');
    if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });
    fs.writeFileSync(path.join(certDir, testCertFilename), '%PDF-1.4 Mock Official Certificate Content');

    testTeacher = await prisma.teacher.create({
      data: {
        userId: testTeacherUser.id,
        bio: 'معلم أول لغة ورياضيات بأكتوبر',
        experienceYears: 12,
        qualification: 'بكالوريوس تربية',
        areaId: testArea.id,
        certificateUrl: `http://localhost:5000/uploads/certificates/${testCertFilename}`,
        isVerified: true
      }
    });

    await prisma.teacherSubject.create({
      data: {
        teacherId: testTeacher.id,
        subjectId: testSubject.id,
        stageId: testStage.id,
        priceOffline: 250,
        priceOnline: 200,
        isOffline: true,
        isOnline: true
      }
    });

    testTeacherToken = jwt.sign({ userId: testTeacherUser.id, userType: 'teacher' }, jwtSecret, { expiresIn: '1d' });

    // Create Teacher 2 (for cross-teacher permission test)
    testOtherTeacherUser = await prisma.user.create({
      data: {
        phone: '01011119002',
        passwordHash: hash,
        name: 'الأستاذ حسام فريد',
        userType: 'teacher',
        status: 'active'
      }
    });
    testOtherTeacher = await prisma.teacher.create({
      data: {
        userId: testOtherTeacherUser.id,
        bio: 'معلم كيمياء',
        experienceYears: 6,
        qualification: 'بكالوريوس علوم',
        areaId: testArea.id
      }
    });
    testOtherTeacherToken = jwt.sign({ userId: testOtherTeacherUser.id, userType: 'teacher' }, jwtSecret, { expiresIn: '1d' });

    // Create Admin
    testAdminUser = await prisma.user.create({
      data: {
        phone: '01099999999',
        passwordHash: hash,
        name: 'مسؤول المنصة',
        userType: 'admin',
        status: 'active'
      }
    });
    testAdminToken = jwt.sign({ userId: testAdminUser.id, userType: 'admin' }, jwtSecret, { expiresIn: '1d' });

    console.log('✅ Fixtures initialized successfully.\n');

    // ----------------------------------------------------
    // TEST 1: GUEST DISCOVERY & PRIVACY
    // ----------------------------------------------------
    console.log('--- TEST 1: Guest Discovery & Phone/Certificate Privacy ---');
    const searchRes = await makeRequest(port, 'GET', `/api/teachers?cityId=${testCity.id}&studyMode=offline`);
    assert.strictEqual(searchRes.status, 200, 'Guest search should return 200');
    assert.strictEqual(searchRes.body.success, true);
    const foundT = searchRes.body.data.find(t => t.id === testTeacher.id);
    assert(foundT, 'Created teacher should appear in search results');
    assert.strictEqual(foundT.user.phone, undefined, 'Privacy: phone must NEVER be exposed in public search');
    assert.strictEqual(foundT.certificateUrl, undefined, 'Privacy: certificateUrl must NEVER be exposed in public search');

    const profileRes = await makeRequest(port, 'GET', `/api/teachers/${testTeacher.id}`);
    assert.strictEqual(profileRes.status, 200, 'Guest profile view should return 200');
    assert.strictEqual(profileRes.body.data.user.phone, undefined, 'Privacy: phone must NEVER be exposed in public profile');
    assert.strictEqual(profileRes.body.data.certificateUrl, undefined, 'Privacy: certificateUrl must NEVER be exposed in public profile');
    console.log('✅ TEST 1 PASSED: Guest discovery and privacy allowlist confirmed.');

    // ----------------------------------------------------
    // TEST 2: PARENT REGISTRATION & SERVER-SIDE EVENT
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Registration & Authoritative Event ---');
    const regRes = await makeRequest(port, 'POST', '/api/auth/register/parent', {}, {
      phone: '01055559999',
      password: 'ParentSecret123',
      name: 'أم عبد الرحمن',
      areaId: testArea.id,
      clientAccountKind: 'guardian'
    });
    assert.strictEqual(regRes.status, 201, 'Parent registration should return 201');
    assert(regRes.body.data.token, 'Token should be returned on registration');
    testParentToken = regRes.body.data.token;
    testParentUser = regRes.body.data.user;
    testParent = regRes.body.data.parent;

    const regEvent = await prisma.platformEvent.findFirst({
      where: { eventType: 'registration_complete', userId: testParentUser.id }
    });
    assert(regEvent, 'Authoritative registration_complete event must be logged');
    assert.strictEqual(regEvent.metadata.userType, 'parent');
    assert.strictEqual(regEvent.metadata.phone, undefined, 'PII must NOT be in analytics metadata');
    console.log('✅ TEST 2 PASSED: Parent registered and server event logged without PII.');

    // ----------------------------------------------------
    // TEST 3: CONTACT REQUEST IDEMPOTENCY & LOST-RESPONSE RETRY
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Contact Requests: True Idempotency & Lost-Response Retry ---');
    const testIdempotencyKey = `idem-key-${Date.now()}`;
    const createReqRes = await makeRequest(
      port,
      'POST',
      '/api/contact-requests',
      { 'Authorization': `Bearer ${testParentToken}`, 'idempotency-key': testIdempotencyKey },
      {
        teacherId: testTeacher.id,
        subjectId: testSubject.id,
        stageId: testStage.id,
        studyMode: 'offline',
        teachingPlace: 'at_student',
        message: 'نحتاج درسين في الأسبوع بالحي المتميز'
      }
    );
    assert.strictEqual(createReqRes.status, 201, 'Creation must return 201');
    assert.strictEqual(createReqRes.body.data.status, 'pending');
    assert.strictEqual(createReqRes.body.data.initiatedBy, 'parent');
    const createdRequestId = createReqRes.body.data.id;

    // Retry after lost response with same idempotency key
    const retryRes = await makeRequest(
      port,
      'POST',
      '/api/contact-requests',
      { 'Authorization': `Bearer ${testParentToken}`, 'idempotency-key': testIdempotencyKey },
      {
        teacherId: testTeacher.id,
        subjectId: testSubject.id,
        stageId: testStage.id,
        studyMode: 'offline',
        teachingPlace: 'at_student',
        message: 'نحتاج درسين في الأسبوع بالحي المتميز'
      }
    );
    assert.strictEqual(retryRes.status, 200, 'Lost response retry with same idempotencyKey must return 200 OK');
    assert.strictEqual(retryRes.body.data.id, createdRequestId, 'Must return the previously created request');

    // Concurrent duplicate insertion attempt
    const [c1, c2] = await Promise.all([
      makeRequest(
        port,
        'POST',
        '/api/contact-requests',
        { 'Authorization': `Bearer ${testParentToken}`, 'idempotency-key': `conc-${Date.now()}-1` },
        { teacherId: testTeacher.id, subjectId: testSubject.id, isRetry: true }
      ),
      makeRequest(
        port,
        'POST',
        '/api/contact-requests',
        { 'Authorization': `Bearer ${testParentToken}`, 'idempotency-key': `conc-${Date.now()}-2` },
        { teacherId: testTeacher.id, subjectId: testSubject.id, isRetry: true }
      )
    ]);
    assert([200, 201].includes(c1.status), 'Concurrent request 1 must succeed gracefully');
    assert([200, 201].includes(c2.status), 'Concurrent request 2 must succeed gracefully');

    const pendingCount = await prisma.contactRequest.count({
      where: { parentId: testParent.id, teacherId: testTeacher.id, subjectId: testSubject.id, status: 'pending' }
    });
    assert.strictEqual(pendingCount, 1, 'Strictly only ONE active pending request may exist');
    console.log('✅ TEST 3 PASSED: True idempotency, lost-response retry, and concurrency resistance verified.');

    // ----------------------------------------------------
    // TEST 4: PENDING PRIVACY & RECIPIENT-ONLY ATOMIC STATE MACHINE
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Pending Privacy & Recipient-Only State Machine ---');
    const incomingRes = await makeRequest(
      port,
      'GET',
      '/api/contact-requests/incoming',
      { 'Authorization': `Bearer ${testTeacherToken}` }
    );
    assert.strictEqual(incomingRes.status, 200);
    const incItem = incomingRes.body.data.find(r => r.id === createdRequestId);
    assert(incItem, 'Incoming request must be visible to teacher');
    assert.strictEqual(incItem.parent.user.phone, null, 'Pending state: parent phone must be NULL');

    // Initiator (parent) attempts to accept their own request
    const illegalSelfAccept = await makeRequest(
      port,
      'PATCH',
      `/api/contact-requests/${createdRequestId}/parent-status`,
      { 'Authorization': `Bearer ${testParentToken}` },
      { status: 'accepted' }
    );
    assert.strictEqual(illegalSelfAccept.status, 403, 'Initiator cannot accept their own request (403)');

    // Third party teacher attempts to accept
    const thirdPartyAccept = await makeRequest(
      port,
      'PATCH',
      `/api/contact-requests/${createdRequestId}/status`,
      { 'Authorization': `Bearer ${testOtherTeacherToken}` },
      { status: 'accepted' }
    );
    assert.strictEqual(thirdPartyAccept.status, 403, 'Third party teacher cannot accept (403)');

    // Recipient accepts request
    const acceptRes = await makeRequest(
      port,
      'PATCH',
      `/api/contact-requests/${createdRequestId}/status`,
      { 'Authorization': `Bearer ${testTeacherToken}` },
      { status: 'accepted', replyMessage: 'موافق وسأتواصل معكم لتحديد الموعد' }
    );
    assert.strictEqual(acceptRes.status, 200, 'Recipient teacher acceptance must return 200');
    assert.strictEqual(acceptRes.body.data.status, 'accepted');
    assert.strictEqual(acceptRes.body.data.parent.user.phone, '01055559999', 'Phone unlocked for teacher after acceptance');

    // Once accepted, duplicate transition must be rejected (409)
    const duplicateAccept = await makeRequest(
      port,
      'PATCH',
      `/api/contact-requests/${createdRequestId}/status`,
      { 'Authorization': `Bearer ${testTeacherToken}` },
      { status: 'rejected' }
    );
    assert.strictEqual(duplicateAccept.status, 409, 'Re-transition of accepted request must return 409 Conflict');

    // Parent sees teacher phone unlocked
    const parentMyRes = await makeRequest(
      port,
      'GET',
      '/api/contact-requests/my',
      { 'Authorization': `Bearer ${testParentToken}` }
    );
    assert.strictEqual(parentMyRes.status, 200);
    const acceptedMyItem = parentMyRes.body.data.find(r => r.id === createdRequestId);
    assert.strictEqual(acceptedMyItem.status, 'accepted');
    assert.strictEqual(acceptedMyItem.teacher.user.phone, '01011119001', 'Teacher phone unlocked for parent');

    // Authorized contact click logging
    const clickRes = await makeRequest(
      port,
      'POST',
      '/api/analytics/contact-click',
      { 'Authorization': `Bearer ${testParentToken}` },
      { requestId: createdRequestId, channel: 'whatsapp' }
    );
    assert.strictEqual(clickRes.status, 201, 'Authorized contact click must return 201');
    console.log('✅ TEST 4 PASSED: Recipient-only atomic transition, phone unlock, and authorized contact click verified.');

    // ----------------------------------------------------
    // TEST 5: CERTIFICATE ACCESS CONTROL & BROWSER AUTHENTICATION
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Certificate Access Security & Browser Authentication ---');
    // Unauthenticated GET
    const unauthCert = await makeRequest(port, 'GET', `/uploads/certificates/${testCertFilename}`);
    assert.strictEqual(unauthCert.status, 401, 'Unauthenticated static certificate access must return 401');

    // Directory traversal attempt
    const traversalAttempt = await makeRequest(port, 'GET', `/uploads/images/../certificates/${testCertFilename}`);
    assert([403, 404].includes(traversalAttempt.status), 'Static directory traversal must be blocked');

    // Parent token access (unauthorized role)
    const parentCert = await makeRequest(
      port,
      'GET',
      `/uploads/certificates/${testCertFilename}`,
      { 'Authorization': `Bearer ${testParentToken}` }
    );
    assert.strictEqual(parentCert.status, 403, 'Parent must be blocked from viewing teacher certificate (403)');

    // Different teacher token access (not owner)
    const otherTeacherCert = await makeRequest(
      port,
      'GET',
      `/uploads/certificates/${testCertFilename}`,
      { 'Authorization': `Bearer ${testOtherTeacherToken}` }
    );
    assert.strictEqual(otherTeacherCert.status, 403, 'Non-owner teacher must be blocked (403)');

    // Teacher owner access with Bearer header
    const ownerCertHeader = await makeRequest(
      port,
      'GET',
      `/uploads/certificates/${testCertFilename}`,
      { 'Authorization': `Bearer ${testTeacherToken}` }
    );
    assert.strictEqual(ownerCertHeader.status, 200, 'Owner teacher with Bearer header must receive 200 OK');
    assert(ownerCertHeader.text.includes('%PDF'), 'Document body must be delivered');

    // Teacher owner access in browser via query param: ?token=<jwt>
    const ownerCertQuery = await makeRequest(
      port,
      'GET',
      `/uploads/certificates/${testCertFilename}?token=${testTeacherToken}`
    );
    assert.strictEqual(ownerCertQuery.status, 200, 'Browser access via ?token=<jwt> must receive 200 OK');
    assert(ownerCertQuery.text.includes('%PDF'), 'Document body must be delivered via query token');

    // Admin access in browser via query param: ?token=<jwt>
    const adminCertQuery = await makeRequest(
      port,
      'GET',
      `/uploads/certificates/${testCertFilename}?token=${testAdminToken}`
    );
    assert.strictEqual(adminCertQuery.status, 200, 'Admin browser access via ?token=<jwt> must receive 200 OK');
    console.log('✅ TEST 5 PASSED: Certificate access strictly protected; browser ?token auth verified.');

    // ----------------------------------------------------
    // TEST 6: ACCOUNT SECURITY & CHANGE PASSWORD
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Account Security & Current Password Validation ---');
    const wrongPassRes = await makeRequest(
      port,
      'PUT',
      '/api/auth/change-password',
      { 'Authorization': `Bearer ${testParentToken}` },
      { currentPassword: 'WrongPassword999', newPassword: 'NewValidPassword123' }
    );
    assert.strictEqual(wrongPassRes.status, 400, 'Incorrect current password must return 400');

    const correctPassRes = await makeRequest(
      port,
      'PUT',
      '/api/auth/change-password',
      { 'Authorization': `Bearer ${testParentToken}` },
      { currentPassword: 'ParentSecret123', newPassword: 'NewValidPassword123' }
    );
    assert.strictEqual(correctPassRes.status, 200, 'Correct current password must return 200');

    // Old password should fail login
    const oldLoginRes = await makeRequest(
      port,
      'POST',
      '/api/auth/login',
      {},
      { phone: '01055559999', password: 'ParentSecret123' }
    );
    assert.strictEqual(oldLoginRes.status, 401, 'Old password must no longer work');

    // New password should succeed login
    const newLoginRes = await makeRequest(
      port,
      'POST',
      '/api/auth/login',
      {},
      { phone: '01055559999', password: 'NewValidPassword123' }
    );
    assert.strictEqual(newLoginRes.status, 200, 'New password must succeed login');
    console.log('✅ TEST 6 PASSED: Current password validation and password change verified.');

    // ----------------------------------------------------
    // TEST 7: NOTIFICATIONS TRUTH & HONEST REPORTING
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Notification Flow & Honest Failure Reporting ---');
    const regFcmRes = await makeRequest(
      port,
      'POST',
      '/api/notifications/register-token',
      { 'Authorization': `Bearer ${testTeacherToken}` },
      { fcmToken: 'fcm-device-test-token-777' }
    );
    assert.strictEqual(regFcmRes.status, 200, 'FCM token registration must return 200');

    const notifSendRes = await makeRequest(
      port,
      'POST',
      '/api/notifications/send',
      { 'Authorization': `Bearer ${testAdminToken}` },
      {
        userId: testTeacherUser.id,
        title: 'تنبيه جديد',
        body: 'لديك طلب تواصل جديد على زاد'
      }
    );
    assert([503, 500].includes(notifSendRes.status), 'Must report 503 unavailable when Firebase unconfigured');
    assert.strictEqual(notifSendRes.body.delivered, false, 'Must NOT claim delivered when Firebase unconfigured');
    console.log('✅ TEST 7 PASSED: Notification token registration and honest delivery status verified.');

    // ----------------------------------------------------
    // TEST 8: ANALYTICS FUNNEL AUDIT & PII VERIFICATION
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Full Analytics Funnel & No-PII Audit ---');
    // Log attribution
    const attr1 = await makeRequest(port, 'POST', '/api/analytics/attribution', {}, {
      utmSource: 'google_search',
      utmCampaign: 'october_math',
      landingPage: '/ar/public',
      sessionId: 'sess_audit_999'
    });
    assert.strictEqual(attr1.status, 201, 'Attribution creation must return 201');

    const attr2 = await makeRequest(port, 'POST', '/api/analytics/attribution', {}, {
      utmSource: 'google_search',
      utmCampaign: 'october_math',
      landingPage: '/ar/public',
      sessionId: 'sess_audit_999'
    });
    assert.strictEqual(attr2.status, 200, 'Duplicate attribution within window must return 200');
    assert.strictEqual(attr2.body.data.deduplicated, true, 'Must report deduplicated');

    // Query all platform_events and assert NO PII
    const allEvents = await prisma.platformEvent.findMany();
    assert(allEvents.length >= 4, 'Must have recorded platform events across the funnel');

    const eventTypes = allEvents.map(e => e.eventType);
    console.log('Recorded event types:', Array.from(new Set(eventTypes)));
    assert(eventTypes.includes('registration_complete'), 'Must include registration_complete');
    assert(eventTypes.includes('contact_request_create'), 'Must include contact_request_create');
    assert(eventTypes.includes('contact_request_transition'), 'Must include contact_request_transition');
    assert(eventTypes.includes('authorized_contact_click'), 'Must include authorized_contact_click');

    for (const ev of allEvents) {
      const meta = JSON.stringify(ev.metadata || {});
      assert(!meta.includes('01011119001'), `Event ${ev.id} leaked teacher phone!`);
      assert(!meta.includes('01055559999'), `Event ${ev.id} leaked parent phone!`);
      assert(!meta.includes('Password123'), `Event ${ev.id} leaked password!`);
      assert(!meta.includes('درسين في الأسبوع'), `Event ${ev.id} leaked private message!`);
    }
    console.log('✅ TEST 8 PASSED: Full analytics funnel verified; strictly zero PII detected in metadata.');

    console.log('\n======================================================');
    console.log('🎉 ALL E2E & SECURITY CHECKS PASSED WITH FULL EVIDENCE');
    console.log('======================================================');

  } finally {
    // Cleanup
    try {
      const certPath = path.resolve('public/uploads/certificates', testCertFilename);
      if (fs.existsSync(certPath)) fs.unlinkSync(certPath);
    } catch (e) {}
    server.close();
  }
}

runSuite().catch(err => {
  console.error('\n❌ E2E SUITE FAILED:', err);
  process.exit(1);
});
