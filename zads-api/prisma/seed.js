const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { locationsData } = require('./locations-data');

const prisma = new PrismaClient();

async function seedLocations() {
    console.log('📍 Seeding locations...');

    let govOrder = 0;
    for (const gov of locationsData) {
        govOrder++;
        const governorate = await prisma.governorate.upsert({
            where: { id: `gov-${gov.name.en.toLowerCase().replace(/\s+/g, '-')}` },
            update: {},
            create: {
                id: `gov-${gov.name.en.toLowerCase().replace(/\s+/g, '-')}`,
                nameAr: gov.name.ar,
                nameEn: gov.name.en,
                sortOrder: govOrder
            }
        });

        let cityOrder = 0;
        for (const city of gov.cities) {
            cityOrder++;
            const createdCity = await prisma.city.upsert({
                where: { id: `city-${gov.name.en.toLowerCase().replace(/\s+/g, '-')}-${city.name.en.toLowerCase().replace(/\s+/g, '-')}` },
                update: {},
                create: {
                    id: `city-${gov.name.en.toLowerCase().replace(/\s+/g, '-')}-${city.name.en.toLowerCase().replace(/\s+/g, '-')}`,
                    governorateId: governorate.id,
                    nameAr: city.name.ar,
                    nameEn: city.name.en,
                    sortOrder: cityOrder
                }
            });

            let areaOrder = 0;
            for (const area of city.areas) {
                areaOrder++;
                await prisma.area.upsert({
                    where: { id: `area-${createdCity.id}-${area.name.en.toLowerCase().replace(/\s+/g, '-')}` },
                    update: {},
                    create: {
                        id: `area-${createdCity.id}-${area.name.en.toLowerCase().replace(/\s+/g, '-')}`,
                        cityId: createdCity.id,
                        nameAr: area.name.ar,
                        nameEn: area.name.en,
                        sortOrder: areaOrder
                    }
                });
            }
        }
    }

    console.log('✅ Locations seeded!');
}

async function main() {
    console.log('🌱 Seeding database...');

    // Seed locations first
    await seedLocations();

    // Create Subjects
    const subjects = await Promise.all([
        prisma.subject.upsert({
            where: { id: 'subj-math' },
            update: {},
            create: { id: 'subj-math', nameAr: 'الرياضيات', nameEn: 'Mathematics', icon: 'calculator', sortOrder: 1 }
        }),
        prisma.subject.upsert({
            where: { id: 'subj-arabic' },
            update: {},
            create: { id: 'subj-arabic', nameAr: 'اللغة العربية', nameEn: 'Arabic', icon: 'book', sortOrder: 2 }
        }),
        prisma.subject.upsert({
            where: { id: 'subj-english' },
            update: {},
            create: { id: 'subj-english', nameAr: 'اللغة الإنجليزية', nameEn: 'English', icon: 'globe', sortOrder: 3 }
        }),
        prisma.subject.upsert({
            where: { id: 'subj-science' },
            update: {},
            create: { id: 'subj-science', nameAr: 'العلوم', nameEn: 'Science', icon: 'flask', sortOrder: 4 }
        }),
        prisma.subject.upsert({
            where: { id: 'subj-physics' },
            update: {},
            create: { id: 'subj-physics', nameAr: 'الفيزياء', nameEn: 'Physics', icon: 'atom', sortOrder: 5 }
        }),
        prisma.subject.upsert({
            where: { id: 'subj-chemistry' },
            update: {},
            create: { id: 'subj-chemistry', nameAr: 'الكيمياء', nameEn: 'Chemistry', icon: 'test-tube', sortOrder: 6 }
        }),
        prisma.subject.upsert({
            where: { id: 'subj-biology' },
            update: {},
            create: { id: 'subj-biology', nameAr: 'الأحياء', nameEn: 'Biology', icon: 'leaf', sortOrder: 7 }
        }),
        prisma.subject.upsert({
            where: { id: 'subj-history' },
            update: {},
            create: { id: 'subj-history', nameAr: 'التاريخ', nameEn: 'History', icon: 'scroll', sortOrder: 8 }
        }),
        prisma.subject.upsert({
            where: { id: 'subj-geography' },
            update: {},
            create: { id: 'subj-geography', nameAr: 'الجغرافيا', nameEn: 'Geography', icon: 'map', sortOrder: 9 }
        }),
        prisma.subject.upsert({
            where: { id: 'subj-french' },
            update: {},
            create: { id: 'subj-french', nameAr: 'اللغة الفرنسية', nameEn: 'French', icon: 'flag-fr', sortOrder: 10 }
        })
    ]);

    console.log(`✅ Created ${subjects.length} subjects`);

    // Create Stages
    const stages = await Promise.all([
        prisma.stage.upsert({
            where: { id: 'stage-primary' },
            update: {},
            create: { id: 'stage-primary', nameAr: 'ابتدائي', nameEn: 'Primary', sortOrder: 1 }
        }),
        prisma.stage.upsert({
            where: { id: 'stage-preparatory' },
            update: {},
            create: { id: 'stage-preparatory', nameAr: 'إعدادي', nameEn: 'Preparatory', sortOrder: 2 }
        }),
        prisma.stage.upsert({
            where: { id: 'stage-secondary' },
            update: {},
            create: { id: 'stage-secondary', nameAr: 'ثانوي', nameEn: 'Secondary', sortOrder: 3 }
        }),
        prisma.stage.upsert({
            where: { id: 'stage-university' },
            update: {},
            create: { id: 'stage-university', nameAr: 'جامعة', nameEn: 'University', sortOrder: 4 }
        })
    ]);

    console.log(`✅ Created ${stages.length} stages`);

    // Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { phone: '01000000000' },
        update: {},
        create: {
            phone: '01000000000',
            passwordHash: adminPassword,
            name: 'Admin',
            userType: 'admin'
        }
    });

    console.log(`✅ Created admin user: ${admin.phone}`);

    // Create Sample Teacher
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const teacherUser = await prisma.user.upsert({
        where: { phone: '01111111111' },
        update: {},
        create: {
            phone: '01111111111',
            passwordHash: teacherPassword,
            name: 'أحمد محمود',
            userType: 'teacher'
        }
    });

    const teacher = await prisma.teacher.upsert({
        where: { userId: teacherUser.id },
        update: {},
        create: {
            userId: teacherUser.id,
            bio: 'مدرس رياضيات بخبرة 10 سنوات في تدريس المرحلة الثانوية',
            experienceYears: 10,
            qualification: 'بكالوريوس تربية - قسم رياضيات',
            areaId: 'area-city-cairo-nasr-city-nasr-city-district-1',  // Nasr City
            lessonTypes: ['at_teacher', 'at_student', 'group']
        }
    });

    // Add subject to teacher
    await prisma.teacherSubject.upsert({
        where: {
            teacherId_subjectId_stageId: {
                teacherId: teacher.id,
                subjectId: 'subj-math',
                stageId: 'stage-secondary'
            }
        },
        update: {},
        create: {
            teacherId: teacher.id,
            subjectId: 'subj-math',
            stageId: 'stage-secondary',
            priceAtTeacher: 150,
            priceAtStudent: 200,
            priceGroup: 80,
            durationMinutes: 60
        }
    });

    console.log(`✅ Created sample teacher: ${teacherUser.name}`);

    // Create Sample Parent
    const parentPassword = await bcrypt.hash('parent123', 10);
    const parentUser = await prisma.user.upsert({
        where: { phone: '01222222222' },
        update: {},
        create: {
            phone: '01222222222',
            passwordHash: parentPassword,
            name: 'سارة أحمد',
            userType: 'parent'
        }
    });

    await prisma.parent.upsert({
        where: { userId: parentUser.id },
        update: {},
        create: {
            userId: parentUser.id,
            areaId: 'area-city-cairo-nasr-city-nasr-city-district-1'
        }
    });

    console.log(`✅ Created sample parent: ${parentUser.name}`);

    console.log('');
    console.log('🎉 Seeding completed!');
    console.log('');
    console.log('Test accounts:');
    console.log('  Admin:   01000000000 / admin123');
    console.log('  Teacher: 01111111111 / teacher123');
    console.log('  Parent:  01222222222 / parent123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
