const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { locationsData } = require('./locations-data');

const prisma = new PrismaClient();

async function seedLocations() {
    console.log('📍 Cleaning up existing location data...');
    // Safe disconnect to avoid foreign key restrict errors
    await prisma.tutorRequest.updateMany({ data: { areaId: null } });
    await prisma.teacher.updateMany({ data: { areaId: null } });
    await prisma.parent.updateMany({ data: { areaId: null } });

    // Delete existing areas, cities, and governorates
    await prisma.area.deleteMany({});
    await prisma.city.deleteMany({});
    await prisma.governorate.deleteMany({});
    console.log('🗑️  Existing location data cleared!');

    console.log('📍 Seeding new Egyptian locations...');

    let govOrder = 0;
    for (const gov of locationsData) {
        govOrder++;
        const govId = `gov-${gov.name.en.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`;
        const governorate = await prisma.governorate.create({
            data: {
                id: govId,
                nameAr: gov.name.ar,
                nameEn: gov.name.en,
                sortOrder: govOrder
            }
        });

        let cityOrder = 0;
        for (const city of gov.cities) {
            cityOrder++;
            const cityId = `city-${gov.name.en.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}-${city.name.en.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`;
            const createdCity = await prisma.city.create({
                data: {
                    id: cityId,
                    governorateId: governorate.id,
                    nameAr: city.name.ar,
                    nameEn: city.name.en,
                    sortOrder: cityOrder
                }
            });

            let areaOrder = 0;
            for (const area of city.areas) {
                areaOrder++;
                const areaId = `area-${createdCity.id}-${area.name.en.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`;
                await prisma.area.create({
                    data: {
                        id: areaId,
                        cityId: createdCity.id,
                        nameAr: area.name.ar,
                        nameEn: area.name.en,
                        sortOrder: areaOrder
                    }
                });
            }
        }
    }

    console.log('✅ New locations seeded successfully!');
}

async function main() {
    console.log('🌱 Seeding database...');

    // Clean up all non-admin users and dummy data
    console.log('🧹 Clearing all dummy data and non-admin users...');
    await prisma.parentChildSubject.deleteMany({});
    await prisma.parentChild.deleteMany({});
    await prisma.favorite.deleteMany({});
    await prisma.contactRequest.deleteMany({});
    await prisma.tutorRequest.deleteMany({});
    await prisma.comparisonItem.deleteMany({});
    await prisma.comparison.deleteMany({});
    await prisma.whatsAppClick.deleteMany({});
    await prisma.teacherSubject.deleteMany({});
    await prisma.teacherAvailability.deleteMany({});
    await prisma.teacher.deleteMany({});
    await prisma.parent.deleteMany({});
    await prisma.user.deleteMany({ where: { NOT: { userType: 'admin' } } });
    console.log('🗑️  Dummy data cleared!');

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
        }),
        prisma.subject.upsert({
            where: { id: 'subj-social-studies' },
            update: {},
            create: { id: 'subj-social-studies', nameAr: 'الدراسات الاجتماعية', nameEn: 'Social Studies', icon: 'users', sortOrder: 11 }
        }),
        prisma.subject.upsert({
            where: { id: 'subj-philosophy' },
            update: {},
            create: { id: 'subj-philosophy', nameAr: 'الفلسفة والمنطق', nameEn: 'Philosophy & Logic', icon: 'brain', sortOrder: 12 }
        }),
        prisma.subject.upsert({
            where: { id: 'subj-psychology' },
            update: {},
            create: { id: 'subj-psychology', nameAr: 'علم النفس والاجتماع', nameEn: 'Psychology & Sociology', icon: 'smile', sortOrder: 13 }
        }),
        prisma.subject.upsert({
            where: { id: 'subj-geology' },
            update: {},
            create: { id: 'subj-geology', nameAr: 'الجيولوجيا', nameEn: 'Geology', icon: 'mountain', sortOrder: 14 }
        }),
        prisma.subject.upsert({
            where: { id: 'subj-computer' },
            update: {},
            create: { id: 'subj-computer', nameAr: 'الحاسب الآلي', nameEn: 'Computer Science', icon: 'monitor', sortOrder: 15 }
        }),
        prisma.subject.upsert({
            where: { id: 'subj-german' },
            update: {},
            create: { id: 'subj-german', nameAr: 'اللغة الألمانية', nameEn: 'German', icon: 'flag-de', sortOrder: 16 }
        }),
        prisma.subject.upsert({
            where: { id: 'subj-italian' },
            update: {},
            create: { id: 'subj-italian', nameAr: 'اللغة الإيطالية', nameEn: 'Italian', icon: 'flag-it', sortOrder: 17 }
        }),
        prisma.subject.upsert({
            where: { id: 'subj-religion' },
            update: {},
            create: { id: 'subj-religion', nameAr: 'التربية الدينية', nameEn: 'Religious Education', icon: 'book-open', sortOrder: 18 }
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
    const adminPassword = await bcrypt.hash('Secoo@3366', 10);
    const admin = await prisma.user.upsert({
        where: { phone: '01000000000' },
        update: {
            email: '5atab.work@gmail.com',
            passwordHash: adminPassword
        },
        create: {
            phone: '01000000000',
            email: '5atab.work@gmail.com',
            passwordHash: adminPassword,
            name: 'Admin',
            userType: 'admin'
        }
    });

    console.log(`✅ Created admin user: ${admin.phone}`);

    console.log('');
    console.log('🎉 Seeding completed!');
    console.log('');
    console.log('Test accounts:');
    console.log('  Admin:   5atab.work@gmail.com / Secoo@3366 (Phone: 01000000000)');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
