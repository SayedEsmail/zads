// Runs prisma/seed.js only on an empty database. seed.js rebuilds the location
// tables and clears every teacher/parent area, so it must not run on restarts
// of a container whose database already holds data.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

(async () => {
    const prisma = new PrismaClient();
    const subjects = await prisma.subject.count();
    await prisma.$disconnect();
    if (subjects > 0) {
        console.log('seed-if-empty: database already seeded, skipping prisma/seed.js');
        return;
    }
    const run = spawnSync(process.execPath, [path.join(__dirname, '..', 'prisma', 'seed.js')], { stdio: 'inherit' });
    process.exit(run.status ?? 1);
})().catch((err) => { console.error(err.message); process.exit(1); });
