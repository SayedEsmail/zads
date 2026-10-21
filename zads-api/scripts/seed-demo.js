// Demo teachers created through the public API (same validation as the UI).
// Used by the Playwright e2e server and by `docker compose up`.
// Idempotent: an already-registered phone is skipped. Passwords are random per
// run because nobody signs in as these accounts; nothing secret is committed.
const crypto = require('node:crypto');

const DEMO_TEACHERS = [
    {
        key: 'math',
        phone: '01000000101',
        name: 'سارة حسن',
        bio: 'مدرسة رياضيات للمرحلة الثانوية في 6 أكتوبر.',
        experienceYears: 7,
        qualification: 'بكالوريوس علوم وتربية - رياضيات',
        governorateId: 'gov-giza',
        cityId: 'city-giza-6th-of-october',
        areaId: 'area-city-giza-6th-of-october-1st-district',
        subject: { subjectId: 'subj-math', stageId: 'stage-secondary', priceOnline: 250, priceOffline: 350, isOnline: true, isOffline: true, durationMinutes: 60 },
        slots: [{ dayOfWeek: 0, startTime: '16:00', endTime: '18:00' }, { dayOfWeek: 3, startTime: '17:00', endTime: '19:00' }],
    },
    {
        key: 'english',
        phone: '01000000102',
        name: 'Omar Khaled',
        bio: 'English teacher for preparatory students in Sheikh Zayed.',
        experienceYears: 4,
        qualification: 'BA English Literature',
        governorateId: 'gov-giza',
        cityId: 'city-giza-sheikh-zayed',
        areaId: 'area-city-giza-sheikh-zayed-8th-district',
        subject: { subjectId: 'subj-english', stageId: 'stage-preparatory', priceOnline: 200, priceOffline: 300, isOnline: true, isOffline: true, durationMinutes: 60 },
        slots: [{ dayOfWeek: 1, startTime: '18:00', endTime: '20:00' }],
    },
];

async function call(apiUrl, method, path, body, token) {
    const res = await fetch(`${apiUrl}/api${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, json };
}

/** Creates the demo teachers that do not exist yet; returns { key: { id, name, ... } } for all of them. */
async function seedDemo(apiUrl) {
    const result = {};
    for (const t of DEMO_TEACHERS) {
        const reg = await call(apiUrl, 'POST', '/auth/register/teacher', {
            phone: t.phone,
            password: crypto.randomBytes(18).toString('base64url'),
            name: t.name,
            bio: t.bio,
            experienceYears: t.experienceYears,
            qualification: t.qualification,
            areaId: t.areaId,
        });

        if (reg.status === 201 || reg.status === 200) {
            const token = reg.json.data.token;
            const sub = await call(apiUrl, 'POST', '/teachers/me/subjects', t.subject, token);
            if (sub.status >= 300) throw new Error(`subject for ${t.key}: ${sub.status} ${JSON.stringify(sub.json)}`);
            const av = await call(apiUrl, 'PUT', '/teachers/me/availability', { slots: t.slots }, token);
            if (av.status >= 300) throw new Error(`availability for ${t.key}: ${av.status} ${JSON.stringify(av.json)}`);
            console.log(`seed-demo: created ${t.key} teacher`);
        } else if (reg.status === 409) {
            console.log(`seed-demo: ${t.key} teacher already exists (${reg.json?.message ?? reg.status})`);
        } else {
            throw new Error(`register ${t.key}: ${reg.status} ${JSON.stringify(reg.json)}`);
        }

        const search = await call(apiUrl, 'GET', `/teachers?areaId=${t.areaId}&subjectId=${t.subject.subjectId}`);
        const found = search.json?.data?.find((x) => x.user?.name === t.name);
        if (!found) throw new Error(`seed-demo: ${t.key} teacher not searchable after seeding`);
        const { phone: _phone, slots: _slots, ...publicFields } = t;
        result[t.key] = { ...publicFields, id: found.id };
    }
    return result;
}

module.exports = { seedDemo, DEMO_TEACHERS };

if (require.main === module) {
    const apiUrl = (process.env.API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
    seedDemo(apiUrl)
        .then((r) => console.log(`seed-demo: ready (${Object.keys(r).join(', ')})`))
        .catch((err) => { console.error(err.message); process.exit(1); });
}
