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
  console.log('🧪 Starting Z04-Z08 & Z18 Privacy, State Machine, and Availability Tests...');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    // 1. Get or create test area, subject, and stage
    let area = await prisma.area.findFirst();
    let subject = await prisma.subject.findFirst();
    let stage = await prisma.stage.findFirst();

    // 2. Get or create test teacher
    let teacher = await prisma.teacher.findFirst({
      where: { user: { status: 'active' } },
      include: { user: true, subjects: true }
    });

    if (!teacher) {
      const teacherUser = await prisma.user.create({
        data: {
          phone: '01011112222',
          name: 'الأستاذ أحمد محمود',
          passwordHash: 'dummy',
          userType: 'teacher',
          status: 'active',
          teacher: {
            create: {
              bio: 'مدرس رياضيات خبير في السادس من أكتوبر',
              areaId: area?.id,
              lessonTypes: ['at_student', 'at_teacher', 'online'],
              certificateUrl: 'https://example.com/cert.pdf',
              subjects: subject && stage ? {
                create: {
                  subjectId: subject.id,
                  stageId: stage.id,
                  priceOnline: 150,
                  priceOffline: 200,
                  isOnline: true,
                  isOffline: true,
                  isActive: true
                }
              } : undefined
            }
          }
        },
        include: { teacher: { include: { subjects: true } } }
      });
      teacher = { ...teacherUser.teacher, user: teacherUser };
    }

    // 3. Get or create test parent
    let parent = await prisma.parent.findFirst({
      where: { user: { status: 'active' } },
      include: { user: true }
    });

    if (!parent) {
      const parentUser = await prisma.user.create({
        data: {
          phone: '01033334444',
          name: 'ولي أمر تجريبي',
          passwordHash: 'dummy',
          userType: 'parent',
          status: 'active',
          parent: {
            create: {
              areaId: area?.id,
              clientAccountKind: 'guardian'
            }
          }
        },
        include: { parent: true }
      });
      parent = { ...parentUser.parent, user: parentUser };
    }

    const teacherToken = jwt.sign(
      { userId: teacher.userId, userType: 'teacher' },
      jwtSecret,
      { expiresIn: '1h' }
    );
    const parentToken = jwt.sign(
      { userId: parent.userId, userType: 'client' },
      jwtSecret,
      { expiresIn: '1h' }
    );

    // ==========================================
    // TEST 1: Public Search Privacy (Z04)
    // ==========================================
    console.log('  Testing Public Teacher Search privacy...');
    const searchRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/teachers?limit=10',
      method: 'GET'
    });
    assert.strictEqual(searchRes.status, 200);
    assert(Array.isArray(searchRes.body.data));
    assert(searchRes.body.data.length > 0);

    for (const t of searchRes.body.data) {
      assert.strictEqual(t.user.phone, undefined, 'Public search must not expose user phone');
      assert.strictEqual(t.certificateUrl, undefined, 'Public search must not expose certificateUrl');
    }
    console.log('  ✓ Public Teacher Search strictly masks phone and certificateUrl');

    // ==========================================
    // TEST 2: Public Teacher By ID Privacy (Z04)
    // ==========================================
    console.log('  Testing Public Teacher Details privacy...');
    const detailRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: `/api/teachers/${teacher.id}`,
      method: 'GET'
    });
    assert.strictEqual(detailRes.status, 200);
    assert.strictEqual(detailRes.body.data.user.phone, undefined, 'Teacher details must not expose phone');
    assert.strictEqual(detailRes.body.data.certificateUrl, undefined, 'Teacher details must not expose certificateUrl to public');
    console.log('  ✓ Public Teacher Details strictly masks phone and certificateUrl');

    // ==========================================
    // TEST 3: Search Pricing and Mode Filter (Z06 & Z08)
    // ==========================================
    console.log('  Testing Search with studyMode and minPrice/maxPrice...');
    const filterRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/teachers?studyMode=online&minPrice=50&maxPrice=500',
      method: 'GET'
    });
    assert.strictEqual(filterRes.status, 200);
    assert(filterRes.body.pagination, 'Pagination contract must be present');
    console.log('  ✓ Search filter with studyMode and minPrice/maxPrice executed cleanly');

    const tutorBrowseRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/tutor-requests',
      method: 'GET',
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert.strictEqual(tutorBrowseRes.status, 200, 'Teacher tutor-request browse must use fields present in the current schema');

    // ==========================================
    // TEST 4: Contact Request Persistence & Privacy (Z05, Z07, Z04)
    // ==========================================
    console.log('  Testing Contact Request Creation, Persistence, and State Machine...');

    // Clean any prior pending requests between this parent and teacher
    await prisma.contactRequest.deleteMany({
      where: { parentId: parent.id, teacherId: teacher.id }
    });

    const createPayload = {
      teacherId: teacher.id,
      subjectId: teacher.subjects[0]?.subjectId || null,
      stageId: teacher.subjects[0]?.stageId || null,
      message: 'Hello, looking for math tutoring.',
      studyMode: 'online',
      teachingPlace: 'online',
      preferredTime: 'Sunday 18:00 - 19:30'
    };

    const createRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/contact-requests',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parentToken}`,
        'Idempotency-Key': `parent-retry-${parent.id}-${teacher.id}`
      }
    }, createPayload);

    assert.strictEqual(createRes.status, 201);
    const createdReq = createRes.body.data;
    assert.strictEqual(createdReq.studyMode, 'online');
    assert.strictEqual(createdReq.teachingPlace, 'online');
    assert.strictEqual(createdReq.preferredTime, 'Sunday 18:00 - 19:30');
    assert.strictEqual(createdReq.status, 'pending');
    assert.strictEqual(createdReq.initiatedBy, 'parent');
    console.log('  ✓ Contact request created with full persistent contracts');

    const retryHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${parentToken}`,
      'Idempotency-Key': `parent-retry-${parent.id}-${teacher.id}`
    };
    const sameIntentRetry = await makeRequest(server, {
      hostname: '127.0.0.1', port, path: '/api/contact-requests', method: 'POST', headers: retryHeaders
    }, createPayload);
    assert.strictEqual(sameIntentRetry.status, 200, 'Identical intent retry must return the original request');

    const changedIntentRetry = await makeRequest(server, {
      hostname: '127.0.0.1', port, path: '/api/contact-requests', method: 'POST', headers: retryHeaders
    }, { ...createPayload, preferredTime: 'Monday 18:00 - 19:30' });
    assert.strictEqual(changedIntentRetry.status, 409, 'Changed preferred time must conflict on idempotency-key reuse');

    if (subject && stage) {
      const expiredTutorRequest = await prisma.tutorRequest.create({
        data: {
          parentId: parent.id,
          subjectId: subject.id,
          stageId: stage.id,
          expiresAt: new Date(Date.now() - 60_000),
          status: 'active'
        }
      });
      const expiredOffer = await makeRequest(server, {
        hostname: '127.0.0.1',
        port,
        path: '/api/contact-requests/teacher',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`
        }
      }, {
        parentId: parent.id,
        subjectId: subject.id,
        stageId: stage.id,
        tutorRequestId: expiredTutorRequest.id
      });
      assert.strictEqual(expiredOffer.status, 400, 'Expired tutor requests cannot be used for teacher-initiated offers');
      await prisma.tutorRequest.delete({ where: { id: expiredTutorRequest.id } });

    }

    // Duplicate check
    const dupRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/contact-requests',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parentToken}`
      }
    }, createPayload);
    assert.strictEqual(dupRes.status, 409, 'Duplicate pending request must return 409 Conflict');
    console.log('  ✓ Duplicate pending request properly rejected with 409 Conflict');

    // Check phone privacy while pending
    const parentListPending = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/contact-requests/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${parentToken}` }
    });
    assert.strictEqual(parentListPending.status, 200);
    const pendingInParentList = parentListPending.body.data.find(r => r.id === createdReq.id);
    assert.strictEqual(pendingInParentList.teacher.user.phone, null, 'Teacher phone must be null while pending');

    const teacherIncomingPending = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/contact-requests/incoming',
      method: 'GET',
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert.strictEqual(teacherIncomingPending.status, 200);
    const pendingInTeacherList = teacherIncomingPending.body.data.find(r => r.id === createdReq.id);
    assert.strictEqual(pendingInTeacherList.parent.user.phone, null, 'Parent phone must be null while pending');
    console.log('  ✓ Phone number strictly masked on both parent and teacher while request is pending');

    // Test unauthorized transition: parent cannot accept their own request
    const parentIllegalAccept = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: `/api/contact-requests/parent/${createdReq.id}/status`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parentToken}`
      }
    }, { status: 'accepted' });
    assert.strictEqual(parentIllegalAccept.status, 403, 'Initiator cannot accept their own request');
    console.log('  ✓ State Machine forbids initiator from accepting their own request');

    // Teacher accepts the request
    const teacherAcceptRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: `/api/contact-requests/${createdReq.id}/status`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`
      }
    }, { status: 'accepted', replyMessage: 'Welcome! I will call you.' });
    assert.strictEqual(teacherAcceptRes.status, 200);
    assert.strictEqual(teacherAcceptRes.body.data.status, 'accepted');
    assert.strictEqual(teacherAcceptRes.body.data.replyMessage, 'Welcome! I will call you.');

    if (subject && stage) {
      await prisma.teacherSubject.upsert({
        where: { teacherId_subjectId_stageId: { teacherId: teacher.id, subjectId: subject.id, stageId: stage.id } },
        update: { isActive: true, isOnline: true, isOffline: true },
        create: {
          teacherId: teacher.id, subjectId: subject.id, stageId: stage.id,
          isOnline: true, isOffline: true, priceOnline: 150, priceOffline: 200, isActive: true
        }
      });
      const activeTutorRequest = await prisma.tutorRequest.create({
        data: { parentId: parent.id, subjectId: subject.id, stageId: stage.id }
      });
      const teacherPayload = {
        parentId: parent.id,
        subjectId: subject.id,
        stageId: stage.id,
        tutorRequestId: activeTutorRequest.id,
        message: 'Offer for requested subject',
        studyMode: 'online',
        teachingPlace: 'online',
        preferredTime: 'Tuesday 17:00'
      };
      const teacherHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`,
        'Idempotency-Key': `teacher-retry-${teacher.id}-${activeTutorRequest.id}`
      };
      const teacherCreate = await makeRequest(server, {
        hostname: '127.0.0.1', port, path: '/api/contact-requests/teacher', method: 'POST', headers: teacherHeaders
      }, teacherPayload);
      assert.strictEqual(teacherCreate.status, 201, 'Teacher offer must be accepted for a matching active tutor request');
      const teacherRetry = await makeRequest(server, {
        hostname: '127.0.0.1', port, path: '/api/contact-requests/teacher', method: 'POST', headers: teacherHeaders
      }, teacherPayload);
      assert.strictEqual(teacherRetry.status, 200, 'Identical teacher offer retry must return the original request');
      const changedTeacherRetry = await makeRequest(server, {
        hostname: '127.0.0.1', port, path: '/api/contact-requests/teacher', method: 'POST', headers: teacherHeaders
      }, { ...teacherPayload, studyMode: 'offline' });
      assert.strictEqual(changedTeacherRetry.status, 409, 'Changed study mode must conflict on teacher idempotency-key reuse');
      await prisma.contactRequest.delete({ where: { id: teacherCreate.body.data.id } });
      await prisma.tutorRequest.delete({ where: { id: activeTutorRequest.id } });
    }

    const raceKey = `parent-race-${parent.id}-${teacher.id}`;
    const racePayloads = [
      { ...createPayload, preferredTime: 'Wednesday 18:00' },
      { ...createPayload, preferredTime: 'Thursday 18:00' }
    ];
    const raceResults = await Promise.all(racePayloads.map(payload => makeRequest(server, {
      hostname: '127.0.0.1', port, path: '/api/contact-requests', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parentToken}`,
        'Idempotency-Key': raceKey
      }
    }, payload)));
    assert.deepStrictEqual(raceResults.map(result => result.status).sort(), [201, 409],
      'Concurrent changed intents sharing an idempotency key must produce one write and one conflict');
    await prisma.contactRequest.deleteMany({ where: { idempotencyKey: raceKey } });

    // Now phone must be visible!
    const parentListAccepted = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/contact-requests/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${parentToken}` }
    });
    const acceptedInParentList = parentListAccepted.body.data.find(r => r.id === createdReq.id);
    assert(acceptedInParentList.teacher.user.phone, 'Teacher phone must be revealed when accepted');

    const teacherIncomingAccepted = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/contact-requests/incoming',
      method: 'GET',
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    const acceptedInTeacherList = teacherIncomingAccepted.body.data.find(r => r.id === createdReq.id);
    assert(acceptedInTeacherList.parent.user.phone, 'Parent phone must be revealed when accepted');
    console.log('  ✓ Phone numbers revealed to both parties only upon accepted status');

    // ==========================================
    // TEST 5: Availability Validation (Z18)
    // ==========================================
    console.log('  Testing Teacher Availability Validation (Z18)...');

    // Invalid format
    const badTimeRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/teachers/me/availability',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`
      }
    }, {
      slots: [{ dayOfWeek: 1, startTime: '9:00', endTime: '10:00' }]
    });
    assert.strictEqual(badTimeRes.status, 400, 'Non-HH:mm format must be rejected');

    // startTime >= endTime
    const backwardsTimeRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/teachers/me/availability',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`
      }
    }, {
      slots: [{ dayOfWeek: 1, startTime: '14:00', endTime: '13:00' }]
    });
    assert.strictEqual(backwardsTimeRes.status, 400, 'startTime >= endTime must be rejected');

    // Overlapping slots on same day
    const overlapRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/teachers/me/availability',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`
      }
    }, {
      slots: [
        { dayOfWeek: 2, startTime: '10:00', endTime: '12:00' },
        { dayOfWeek: 2, startTime: '11:00', endTime: '13:00' }
      ]
    });
    assert.strictEqual(overlapRes.status, 400, 'Overlapping slots must be rejected');

    // Valid slots
    const validSlotsRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port,
      path: '/api/teachers/me/availability',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`
      }
    }, {
      slots: [
        { dayOfWeek: 2, startTime: '10:00', endTime: '12:00' },
        { dayOfWeek: 2, startTime: '14:00', endTime: '16:00' }
      ]
    });
    assert.strictEqual(validSlotsRes.status, 200, 'Valid slots must succeed');
    assert.strictEqual(validSlotsRes.body.data.length, 2);
    console.log('  ✓ Teacher Availability HH:mm, range, and overlap validation passed');

    console.log('🎉 All Z04, Z05, Z06, Z07, Z08, and Z18 tests passed successfully!\n');

  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
