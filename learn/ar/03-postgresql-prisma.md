<div dir="rtl">
<style>
  pre, code, .mermaid {
    direction: ltr !important;
    text-align: left !important;
  }
  th, td {
    text-align: right !important;
  }
</style>

# 📘 خريطة تعلم PostgreSQL و Prisma — من مشروع Zads



> **المستوى:** من الصفر حتى فهم كامل لهيكل الداتابيز
> **على مسار الـ fullstack:** أيام 13–19 فقط (14 ساعة). الخريطة في [00-fullstack-path.md](./00-fullstack-path.md).
> **فيديو الأيام دي:** [SQL في 60 دقيقة](https://www.youtube.com/watch?v=p3qvj9hO_Bo) ثم أجزاء العلاقات والقيود من [PostgreSQL — freeCodeCamp](https://www.youtube.com/watch?v=SpfIwlAYaKk). تمارين: [pgexercises.com](https://pgexercises.com/).
> **الطريقة:** كل موضوع فيه شرح + رابط لملف حقيقي من المشروع

---

## 🗺️ الخريطة الكاملة

```
المرحلة 1: أساسيات قواعد البيانات ← (أسبوع 1)
    │
    ▼
المرحلة 2: Prisma Schema — تعريف الهيكل ← (أسبوع 1)
    │
    ▼
المرحلة 3: العلاقات بين الجداول ← (أسبوع 1-2)
    │
    ▼
المرحلة 4: Prisma Client — التعامل مع البيانات ← (أسبوع 2)
    │
    ▼
المرحلة 5: Migrations — إدارة التغييرات ← (أسبوع 2-3)
    │
    ▼
المرحلة 6: أنماط متقدمة ← (أسبوع 3)
    │
    ▼
المرحلة 7: Neon — استضافة سحابية ← (أسبوع 3)
```

---

---

## 📦 المرحلة 1: أساسيات قواعد البيانات

> **الهدف:** تفهم ايه هي قاعدة البيانات وليه بنستخدمها.

### 1.1 ايه هي قاعدة البيانات العلائقية (Relational Database)؟

فكر فيها كـ **Excel sheets مترابطة**:

```
┌──────────────── users (جدول المستخدمين) ────────────────┐
│ id    │ name    │ phone       │ userType │ status  │
│───────│─────────│─────────────│──────────│─────────│
│ uuid1 │ أحمد    │ 01012345678 │ teacher  │ active  │
│ uuid2 │ محمد    │ 01098765432 │ parent   │ active  │
│ uuid3 │ سارة    │ 01055555555 │ admin    │ active  │
└─────────────────────────────────────────────────────────┘

┌──────────────── teachers (جدول المدرسين) ───────────────┐
│ id    │ userId  │ bio           │ rating │ areaId │
│───────│─────────│───────────────│────────│────────│
│ tid1  │ uuid1   │ مدرس رياضيات │ 4.5    │ area1  │
│       │    ↑    │               │        │        │
│       │  FK     │  يشير لجدول users      │        │
└─────────────────────────────────────────────────────────┘
```

**المفاهيم الأساسية:**

| المفهوم | المعنى | مثال |
|---------|--------|------|
| **Table (جدول)** | مجموعة بيانات من نفس النوع | `users`, `teachers` |
| **Row (صف)** | سجل واحد | مستخدم واحد |
| **Column (عمود)** | خاصية | `name`, `phone`, `status` |
| **Primary Key (PK)** | معرف فريد لكل صف | `id` (UUID) |
| **Foreign Key (FK)** | رابط لجدول تاني | `userId` في جدول `teachers` بيشير لـ `users` |
| **Index** | فهرس للبحث السريع | عمل index على `phone` |

### 1.2 ليه PostgreSQL؟

| الميزة | الشرح |
|--------|-------|
| **موثوقة** | 35+ سنة تطوير، مستخدمة في أكبر الشركات |
| **علائقية** | العلاقات بين الجداول واضحة ومضبوطة |
| **JSON Support** | بتدعم تخزين JSON (بنستخدمه في `lessonTypes`) |
| **ACID** | كل عملية إما تنجح بالكامل أو تفشل بالكامل |
| **مجانية ومفتوحة** | Open source |

### 1.3 ايه هو Prisma؟

Prisma هو **ORM (Object-Relational Mapping)** — بيسمحلك تتعامل مع الداتابيز بـ JavaScript بدل SQL:

```
بدون ORM (SQL):
  SELECT * FROM users WHERE phone = '01012345678';

مع Prisma (JavaScript):
  const user = await prisma.user.findFirst({ where: { phone: '01012345678' } });
```

**مميزات Prisma:**
- ✅ **Type-safe** — TypeScript بيعرف شكل البيانات
- ✅ **Schema-first** — بتكتب الهيكل مرة واحدة وبيولد كل حاجة
- ✅ **Migrations** — بتتبع تغييرات الداتابيز
- ✅ **Auto-completion** — IDE بيساعدك وانت بتكتب queries

---

## 📦 المرحلة 2: Prisma Schema — تعريف الهيكل

> **الهدف:** تفهم ازاي بنعرف شكل الداتابيز في Prisma.

### 2.1 ملف الـ Schema

📄 **افتح وابدأ اقرأ:**
- [schema.prisma](file:///Users/sayed/Devs/Zads/zads-api/prisma/schema.prisma) — **الملف الأهم — ده خريطة الداتابيز بالكامل**

**الملف بيتكون من 3 أجزاء:**

#### الجزء 1: إعدادات الاتصال
```prisma
// مزود الداتابيز
generator client {
    provider = "prisma-client-js"  // بيولد JavaScript client
}

// اتصال الداتابيز
datasource db {
    provider  = "postgresql"           // نوع الداتابيز
    url       = env("DATABASE_URL")    // رابط الاتصال (pooled)
    directUrl = env("DIRECT_URL")      // رابط مباشر (للـ migrations)
}
```

#### الجزء 2: الـ Enums (القيم المحددة)
```prisma
enum UserType {
    teacher    // مدرس
    parent     // ولي أمر/طالب
    admin      // مدير
}

enum UserStatus {
    active     // فعال
    suspended  // موقوف
    inactive   // غير فعال
}

enum LessonType {
    online            // أونلاين
    at_teacher        // عند المدرس
    at_student        // عند الطالب
    at_venue          // في مكان مخصص
}
```

> **ليه Enums؟** عشان نحدد القيم المسموحة — مش هينفع حد يحط `userType = "hacker"` مثلاً.

#### الجزء 3: الـ Models (الجداول)
```prisma
model User {
    // Primary Key
    id           String     @id @default(uuid())

    // الأعمدة
    phone        String     @unique
    email        String?    @unique      // ? = اختياري (nullable)
    passwordHash String     @map("password_hash")
    name         String
    avatarUrl    String?    @map("avatar_url")
    userType     UserType   @map("user_type")
    status       UserStatus @default(active)

    // العلاقات
    teacher      Teacher?   // مدرس (اختياري — لو مش teacher مش هيكون عنده)
    parent       Parent?    // ولي أمر (اختياري)

    // Timestamps
    createdAt    DateTime   @default(now()) @map("created_at")
    updatedAt    DateTime   @updatedAt @map("updated_at")

    // اسم الجدول في الداتابيز
    @@map("users")
}
```

### 2.2 فهم الرموز في Prisma Schema

| الرمز | المعنى | مثال |
|-------|--------|------|
| `@id` | Primary Key | `id String @id` |
| `@default(uuid())` | قيمة افتراضية UUID | معرف فريد تلقائي |
| `@default(now())` | التاريخ الحالي | `createdAt` |
| `@unique` | قيمة فريدة (مش متكررة) | `phone @unique` |
| `@map("name")` | اسم العمود في الداتابيز | `passwordHash @map("password_hash")` |
| `@@map("name")` | اسم الجدول في الداتابيز | `@@map("users")` |
| `?` | اختياري (nullable) | `email String?` |
| `@updatedAt` | يتحدث تلقائياً | `updatedAt DateTime @updatedAt` |
| `@default(active)` | قيمة افتراضية من enum | `status @default(active)` |
| `@@unique([a, b])` | مفتاح مركب فريد | `@@unique([parentId, teacherId])` |

### 2.3 الموديلات الـ 19 في المشروع — كل واحد ووظيفته

📄 **كلهم في:** [schema.prisma](file:///Users/sayed/Devs/Zads/zads-api/prisma/schema.prisma)

#### المستخدمين (Core):

```
┌─────────┐     ┌──────────┐     ┌──────────┐
│  User   │────→│ Teacher  │     │  Parent  │
│         │────→│          │     │          │
│ الأساس  │     │ بيانات   │     │ بيانات   │
│         │     │ المدرس   │     │ العميل   │
└─────────┘     └──────────┘     └──────────┘
```

| الجدول | الغرض | الحقول الأهم |
|--------|-------|-------------|
| `User` | المستخدم الأساسي | phone, email, name, userType, status |
| `Teacher` | ملف المدرس الإضافي | bio, experience, rating, views, isVerified |
| `Parent` | ملف العميل الإضافي | clientAccountKind (student/guardian) |

#### الأولاد والمواد:

```
┌──────────┐     ┌─────────────┐     ┌─────────────────┐
│  Parent  │────→│ ParentChild │────→│ParentChildSubject│
│          │     │ (الولد)      │     │ (مواد الولد)     │
└──────────┘     └─────────────┘     └─────────────────┘
```

| الجدول | الغرض |
|--------|-------|
| `ParentChild` | أولاد العميل (اسم، مرحلة، نوع مدرسة) |
| `ParentChildSubject` | مواد كل ولد (رابط بين الولد والمادة) |

#### المواد والمراحل:

| الجدول | الغرض | البيانات |
|--------|-------|---------|
| `Subject` | المواد الدراسية | رياضيات، عربي، إنجليزي... (18 مادة) |
| `Stage` | المراحل التعليمية | ابتدائي، إعدادي، ثانوي، جامعي |
| `TeacherSubject` | مواد المدرس + أسعاره | مادة + مرحلة + 6 أسعار مختلفة |

#### الموقع:

```
┌──────────────┐     ┌────────┐     ┌────────┐
│ Governorate  │────→│  City  │────→│  Area  │
│ (محافظة)     │     │ (مدينة) │     │(منطقة) │
└──────────────┘     └────────┘     └────────┘
```

| الجدول | الغرض |
|--------|-------|
| `Governorate` | المحافظات المصرية |
| `City` | المدن داخل كل محافظة |
| `Area` | المناطق/الأحياء داخل كل مدينة |

#### التفاعلات:

| الجدول | الغرض |
|--------|-------|
| `Favorite` | المدرسين المفضلين عند العميل |
| `ContactRequest` | طلب تواصل بين عميل ومدرس |
| `TutorRequest` | طلب "عايز مدرس" من العميل |
| `Comparison` | قائمة مقارنة مدرسين |
| `ComparisonItem` | مدرس في قائمة مقارنة |
| `TeacherAvailability` | مواعيد المدرس الأسبوعية |
| `WhatsAppClick` | تتبع نقرات رابط WhatsApp |
| `PlatformEvent` | أحداث القمع والإسناد جوا الداتابيز (`eventType`, `sessionId`, `dedupKey`) |

`ContactRequest` كمان فيه `studyMode` و `teachingPlace` و `preferredTime` و `replyMessage` و `initiatedBy` و `tutorRequestId` و `idempotencyKey`. أرقام التليفون متخفية لحد ما الطلب يبقى `accepted`. التفاصيل في [04-platform-now.md](./04-platform-now.md).

---

## 📦 المرحلة 3: العلاقات بين الجداول

> **الهدف:** تفهم أنواع العلاقات وازاي بنربط الجداول ببعض.

### 3.1 One-to-One (واحد لواحد)

**مثال:** كل `User` ممكن يكون عنده `Teacher` واحد بس.

```prisma
// في User
model User {
    teacher Teacher?     // ← علاقة اختيارية (مش كل user مدرس)
}

// في Teacher
model Teacher {
    userId  String  @unique @map("user_id")    // FK + unique
    user    User    @relation(fields: [userId], references: [id])
}
```

```
User (uuid1) ←──── 1:1 ────→ Teacher (tid1)
     Ahmed                    مدرس رياضيات
```

📄 **شوف في الـ schema:**
- `User` ↔ `Teacher` (خط 30-40 تقريباً)
- `User` ↔ `Parent` (نفس النمط)

### 3.2 One-to-Many (واحد لكتير)

**مثال:** كل `Parent` ممكن يكون عنده كتير `ParentChild`.

```prisma
// في Parent
model Parent {
    children ParentChild[]    // ← مصفوفة (كتير أولاد)
}

// في ParentChild
model ParentChild {
    parentId String  @map("parent_id")     // FK
    parent   Parent  @relation(fields: [parentId], references: [id])
}
```

```
Parent (pid1)
  ├── ParentChild (c1) — أحمد، ابتدائي
  ├── ParentChild (c2) — سارة، إعدادي
  └── ParentChild (c3) — محمد، ثانوي
```

📄 **شوف في الـ schema:**
- `Parent` → `ParentChild[]`
- `Governorate` → `City[]` → `Area[]`
- `Teacher` → `TeacherSubject[]`

### 3.3 Many-to-Many (كتير لكتير)

**مثال:** مدرس واحد بيدرّس مواد كتير، وكل مادة بيدرّسها مدرسين كتير.

في Prisma بنعمل **جدول وسيط (junction table)**:

```prisma
// TeacherSubject هو الجدول الوسيط
model TeacherSubject {
    id         String   @id @default(uuid())
    teacherId  String   @map("teacher_id")
    subjectId  String   @map("subject_id")
    stageId    String?  @map("stage_id")

    // الأسعار (6 أنواع مختلفة)
    priceAtTeacher  Decimal? @map("price_at_teacher")
    priceAtStudent  Decimal? @map("price_at_student")
    priceGroup      Decimal? @map("price_group")
    priceOnline     Decimal? @map("price_online")
    priceOffline    Decimal? @map("price_offline")

    // العلاقات
    teacher    Teacher  @relation(fields: [teacherId], references: [id])
    subject    Subject  @relation(fields: [subjectId], references: [id])
    stage      Stage?   @relation(fields: [stageId], references: [id])
}
```

```
Teacher (أحمد) ←──→ TeacherSubject ←──→ Subject (رياضيات)
                         │
                         ├── stage: ابتدائي
                         ├── priceAtTeacher: 150
                         ├── priceAtStudent: 200
                         └── priceOnline: 100
```

📄 **شوف في الـ schema:**
- `TeacherSubject` — الجدول الوسيط بين `Teacher` و `Subject`
- `ParentChildSubject` — الجدول الوسيط بين `ParentChild` و `Subject`
- `Favorite` — العلاقة بين `Parent` و `Teacher`

### 3.4 Self-referencing & Composite Keys

**مثال: `Favorite`** — مفتاح مركب فريد:

```prisma
model Favorite {
    id        String  @id @default(uuid())
    parentId  String  @map("parent_id")
    teacherId String  @map("teacher_id")

    // ده بيمنع نفس العميل يفضل نفس المدرس مرتين
    @@unique([parentId, teacherId])
}
```

### 3.5 خريطة العلاقات الكاملة (Entity Relationship Diagram)

```
                          ┌──────────────┐
                          │     User     │
                          │              │
                          │  id (PK)     │
                          │  phone       │
                          │  userType    │
                          └──────┬───────┘
                          ┌──────┴───────┐
                    1:1   │              │   1:1
              ┌───────────┘              └──────────┐
              ▼                                      ▼
      ┌──────────────┐                      ┌──────────────┐
      │   Teacher    │                      │    Parent    │
      │              │                      │              │
      │  bio         │                      │  accountKind │
      └──────┬───────┘                      └──────┬───────┘
             │                             │ 1:N
             │                             ▼
     ┌───────┼────────┐                     ┌──────────────┐
     │       │        │                     │ ParentChild  │
     │ 1:N   │ 1:N    │ 1:N                │              │
     ▼       ▼        ▼                     │  name        │
┌─────────┐ ┌──────┐ ┌──────────────┐       │  stage       │
│Teacher  │ │Avail.│ │WhatsAppClick │       └──────┬───────┘
│Subject  │ │      │ │              │              │ 1:N
│         │ └──────┘ └──────────────┘              ▼
│ prices  │                                 ┌──────────────┐
└────┬────┘                                 │ParentChild   │
     │                                      │Subject       │
     │ N:1                                  └──────────────┘
     ▼
┌──────────────┐     ┌──────────────┐
│   Subject    │     │    Stage     │
│              │     │              │
│  nameAr      │     │  nameAr     │
│  nameEn      │     │  nameEn     │
└──────────────┘     └──────────────┘


┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Governorate  │────→│    City      │────→│    Area      │
│ (محافظة)     │ 1:N │  (مدينة)     │ 1:N │  (منطقة)     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                    ┌────────────┤
                                    │            │
                              Teacher.areaId  Parent.areaId


Parent ←──N:M──→ Teacher    عبر: Favorite, ContactRequest
Parent ──1:N──→ TutorRequest
Parent ──1:N──→ Comparison ──1:N──→ ComparisonItem → Teacher
```

#### 📊 الرسم البياني التفاعلي للعلاقات الأساسية (Core ERD):

```mermaid
erDiagram
    USER ||--o| TEACHER : "1:1 userId"
    USER ||--o| PARENT : "1:1 userId"
    PARENT ||--o{ PARENT_CHILD : "1:N parentId"
    TEACHER ||--o{ TEACHER_SUBJECT : "1:N teacherId"
    SUBJECT ||--o{ TEACHER_SUBJECT : "1:N subjectId"
    STAGE ||--o{ TEACHER_SUBJECT : "1:N stageId"
    PARENT_CHILD ||--o{ PARENT_CHILD_SUBJECT : "1:N childId"
    SUBJECT ||--o{ PARENT_CHILD_SUBJECT : "1:N subjectId"
    PARENT ||--o{ FAVORITE : "1:N parentId"
    TEACHER ||--o{ FAVORITE : "1:N teacherId"

    USER {
        string id PK
        string phone UK
        string name
        enum user_type
    }
    TEACHER {
        string id PK
        string user_id FK
        string bio
        boolean is_verified
    }
    PARENT {
        string id PK
        string user_id FK
        enum client_account_kind
    }
    TEACHER_SUBJECT {
        string id PK
        string teacher_id FK
        string subject_id FK
        decimal price_online
    }
```


---

## 📦 المرحلة 4: Prisma Client — التعامل مع البيانات

> **الهدف:** تفهم ازاي بنقرأ ونكتب بيانات في الداتابيز.

### 4.1 إعداد Prisma Client

📄 **شوف:**
- [database.js](file:///Users/sayed/Devs/Zads/zads-api/src/config/database.js) — Prisma Client singleton

```js
const { PrismaClient } = require('@prisma/client');

// Singleton pattern — instance واحد في كل التطبيق
const prisma = new PrismaClient({
    log: process.env.PRISMA_QUERY_LOG === 'true'
        ? ['query', 'info', 'warn', 'error']
        : ['error']
});

module.exports = prisma;
```

**ليه Singleton؟** عشان مش نعمل كتير connections مع الداتابيز — connection واحد ومشترك.

### 4.2 عمليات CRUD الأساسية

#### Create (إنشاء):
```js
const user = await prisma.user.create({
    data: {
        phone: '01012345678',
        name: 'أحمد',
        passwordHash: hashedPassword,
        userType: 'teacher',
    }
});
```

📄 **شوف:** [auth.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/auth.controller.js) — `register` function

#### Read (قراءة):
```js
// واحد
const user = await prisma.user.findUnique({
    where: { id: userId }
});

// واحد بشرط
const user = await prisma.user.findFirst({
    where: { phone: '01012345678' }
});

// كتير
const teachers = await prisma.teacher.findMany({
    where: { isVerified: true },
    orderBy: { rating: 'desc' },
    take: 10  // أول 10
});

// عدد
const count = await prisma.teacher.count({
    where: { isVerified: true }
});
```

📄 **شوف:** [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — `searchTeachers` function

#### Update (تحديث):
```js
const updated = await prisma.teacher.update({
    where: { id: teacherId },
    data: { bio: 'مدرس رياضيات متميز' }
});
```

📄 **شوف:** [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — `updateMyProfile`

#### Delete (حذف):
```js
await prisma.favorite.delete({
    where: { id: favoriteId }
});

// أو حذف بشرط مركب
await prisma.favorite.deleteMany({
    where: { parentId, teacherId }
});
```

📄 **شوف:** [favorites.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/favorites.controller.js) — `removeFavorite`

### 4.3 Include — جلب العلاقات

```js
// جيب المدرس مع بيانات المستخدم الأساسي
const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
        user: true,  // ← بيجيب الـ User كمان
    }
});
// النتيجة: { id, bio, rating, user: { name, phone, email } }

// nested includes — علاقات متداخلة
const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
        user: true,
        area: {
            include: {
                city: {
                    include: {
                        governorate: true
                    }
                }
            }
        },
        subjects: {
            include: {
                subject: true,   // اسم المادة
                stage: true      // اسم المرحلة
            }
        }
    }
});
// النتيجة: { id, bio, user: {...}, area: { name, city: { name, governorate: { name } } }, subjects: [{subject: {nameAr}, stage: {nameAr}, price...}] }
```

📄 **شوف الـ includes المعقدة:**
- [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — `getTeacherById` — أكبر include
- [auth.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/auth.controller.js) — `getProfile` — include حسب الـ userType

### 4.4 Where — شروط البحث

```js
// شرط بسيط
where: { isVerified: true }

// AND (كل الشروط)
where: {
    isVerified: true,
    rating: { gte: 4.0 }  // ≥ 4.0
}

// OR (أي شرط)
where: {
    OR: [
        { phone: '01012345678' },
        { email: 'ahmed@gmail.com' }
    ]
}

// شرط على العلاقة
where: {
    subjects: {
        some: {          // "some" = في واحد على الأقل
            subjectId: 'math-id'
        }
    }
}

// شرط مركب
where: {
    AND: [
        { isVerified: true },
        { area: { cityId: 'cairo-id' } },
        { subjects: { some: { subjectId: 'math-id' } } }
    ]
}
```

**عوامل المقارنة:**
| العامل | المعنى | مثال |
|--------|--------|------|
| `equals` | يساوي | `{ rating: { equals: 5 } }` |
| `not` | لا يساوي | `{ status: { not: 'suspended' } }` |
| `gt` | أكبر من | `{ experience: { gt: 3 } }` |
| `gte` | أكبر من أو يساوي | `{ rating: { gte: 4 } }` |
| `lt` | أقل من | `{ price: { lt: 200 } }` |
| `lte` | أقل من أو يساوي | `{ price: { lte: 150 } }` |
| `contains` | يحتوي على | `{ name: { contains: 'أحمد' } }` |
| `in` | ضمن قائمة | `{ id: { in: ['a', 'b', 'c'] } }` |

### 4.5 Select vs Include

```js
// include → كل الحقول + العلاقة
include: { user: true }
// النتيجة: { id, bio, rating, ..., user: { id, name, phone, email, ... } }

// select → حقول محددة فقط
select: {
    id: true,
    bio: true,
    user: {
        select: { name: true, phone: true }
    }
}
// النتيجة: { id, bio, user: { name, phone } }  (أسرع — بيانات أقل)
```

### 4.6 Transactions — عمليات ذرية

لما عايز تعمل أكتر من عملية "كلها تنجح أو كلها تفشل":

```js
// مثال: تسجيل مدرس جديد — لازم ينشئ User + Teacher مع بعض
const result = await prisma.$transaction(async (tx) => {
    // 1. إنشاء المستخدم
    const user = await tx.user.create({
        data: { phone, name, passwordHash, userType: 'teacher' }
    });

    // 2. إنشاء ملف المدرس
    const teacher = await tx.teacher.create({
        data: { userId: user.id, bio, experienceYears }
    });

    return { user, teacher };
});
// لو أي عملية فشلت → كل حاجة بترجع كأنها مش حصلت
```

📄 **شوف:**
- [auth.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/auth.controller.js) — `register` — transaction لإنشاء user + teacher/parent
- [parents.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/parents.controller.js) — `addChild` — transaction لإنشاء child + subjects + tutor requests

### 4.7 Aggregation — عمليات تجميعية

```js
// عدد
const count = await prisma.teacher.count({ where: { isVerified: true } });

// مجموع / متوسط
const stats = await prisma.teacher.aggregate({
    _avg: { rating: true },
    _max: { experienceYears: true },
    _count: true,
});

// تجميع حسب حقل
const byType = await prisma.user.groupBy({
    by: ['userType'],
    _count: true,
});
// [{ userType: 'teacher', _count: 50 }, { userType: 'parent', _count: 100 }]
```

📄 **شوف:**
- [admin.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/admin.controller.js) — `getDashboardStats` — إحصائيات شاملة
- [analytics.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/analytics.controller.js) — groupBy

---

## 📦 المرحلة 5: Migrations — إدارة التغييرات

> **الهدف:** تفهم ازاي بنغير هيكل الداتابيز بأمان.

### 5.1 ايه هي الـ Migrations؟

الـ migration هي **ملف بيوصف تغيير في هيكل الداتابيز** — زي Git بس للداتابيز:

```
Migration 1: إنشاء الهيكل الأولي
    │ CREATE TABLE users (...)
    │ CREATE TABLE teachers (...)
    ▼
Migration 2: إضافة جداول الموقع
    │ CREATE TABLE governorates (...)
    │ CREATE TABLE cities (...)
    ▼
Migration 3: إضافة جدول أولاد
    │ CREATE TABLE parent_children (...)
    ▼
... وهكذا
```

### 5.2 الـ Migrations في المشروع

📄 **شوف:**
- [migrations/](file:///Users/sayed/Devs/Zads/zads-api/prisma/migrations) — كل الـ migrations

| الـ Migration | التاريخ | الوصف |
|-------------|---------|-------|
| `20251226124027_zads` | 26/12/2025 | الهيكل الأولي الكامل |
| `20251227021545_add_locations` | 27/12/2025 | جداول الموقع (محافظات/مدن/مناطق) |
| `20251227104301_add_parent_children` | 27/12/2025 | جدول أولاد العملاء |
| `20251227113221_add_tutor_request_area` | 27/12/2025 | عمود area في طلبات الدروس |
| `20260425000000_platform_evolution` | 25/04/2026 | Study mode + تطوير العميل |
| `20260518194436_init` | 18/05/2026 | إعادة تهيئة/توحيد |

### 5.3 أوامر الـ Migration

```bash
# 1. تطوير — إنشاء migration جديد
pnpm run db:migrate
# = prisma migrate dev
# بيقارن الـ schema مع الداتابيز ← بيولد SQL ← بينفذه

# 2. إنتاج — تنفيذ migrations موجودة
pnpm run db:migrate:prod
# = prisma migrate deploy
# بينفذ الـ migrations بدون تغيير (safe, non-interactive)

# 3. توليد Prisma Client
pnpm run db:generate
# = prisma generate
# بيعمل update للـ JavaScript client عشان يطابق الـ schema

# 4. تعبئة بيانات أولية
pnpm run db:seed
# = node prisma/seed.js
```

### 5.4 الـ Seed — بيانات أولية

📄 **شوف:**
- [seed.js](file:///Users/sayed/Devs/Zads/zads-api/prisma/seed.js) — سكريبت التعبئة
- [locations-data.js](file:///Users/sayed/Devs/Zads/zads-api/prisma/locations-data.js) — بيانات المحافظات (47KB!)

**الـ seed بيعمل:**
1. **18 مادة دراسية** — رياضيات، عربي، إنجليزي...
2. **4 مراحل تعليمية** — ابتدائي، إعدادي، ثانوي، جامعي
3. **مواقع مصر كاملة** — كل المحافظات ← المدن ← المناطق
4. **مستخدم admin** — رقم: 01000000000

**بيستخدم `upsert`:**
```js
await prisma.subject.upsert({
    where: { id: 'math-uuid' },
    update: {},  // لو موجود مش بيتغير
    create: { id: 'math-uuid', nameAr: 'الرياضيات', nameEn: 'Mathematics' }
});
// upsert = update + insert → لو مش موجود بينشئه، لو موجود بيعدله
```

### 5.5 Prisma Config

📄 **شوف:**
- [prisma.config.ts](file:///Users/sayed/Devs/Zads/zads-api/prisma.config.ts) — إعدادات خاصة

```ts
// بيستخدم DIRECT_URL (مش pooled) للـ migrations
// عشان الـ pooled connection مش بتدعم DDL (تغيير الهيكل)
```

---

## 📦 المرحلة 6: أنماط متقدمة

> **الهدف:** تفهم الأنماط الاحترافية في التعامل مع الداتابيز.

### 6.1 Dynamic Query Building — بناء queries ديناميكي

```js
// بدل ما نعمل if/else لكل حالة
const where = {};

if (subjectId) {
    where.subjects = { some: { subjectId } };
}
if (stageId) {
    where.subjects = {
        ...where.subjects,
        some: { ...where.subjects?.some, stageId }
    };
}
if (governorateId) {
    where.area = { city: { governorateId } };
}
if (search) {
    where.user = { name: { contains: search, mode: 'insensitive' } };
}

const teachers = await prisma.teacher.findMany({ where });
```

📄 **شوف:**
- [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — `searchTeachers` — بناء where ديناميكي

### 6.2 Pagination Pattern — نمط الصفحات

```js
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

// طلبين بالتوازي — أسرع
const [items, total] = await Promise.all([
    prisma.teacher.findMany({
        where,
        skip,
        take: limit,
        include: { user: true }
    }),
    prisma.teacher.count({ where })
]);

const totalPages = Math.ceil(total / limit);

return ApiResponse.paginated(res, "Success", items, {
    page,
    limit,
    total,
    totalPages
});
```

> **لاحظ `Promise.all`** — بيشغل الـ query والـ count في نفس الوقت بدل واحد ورا التاني.

### 6.3 Conditional Includes — جلب علاقات حسب الحالة

```js
// في getProfile — بنجيب بيانات مختلفة حسب نوع المستخدم
const include = {};

if (user.userType === 'teacher') {
    include.teacher = {
        include: {
            area: { include: { city: { include: { governorate: true } } } },
            subjects: { include: { subject: true, stage: true } },
            availability: true
        }
    };
} else if (user.userType === 'parent') {
    include.parent = {
        include: {
            area: { include: { city: { include: { governorate: true } } } },
            children: { include: { subjects: { include: { subject: true } } } }
        }
    };
}

const profile = await prisma.user.findUnique({
    where: { id: userId },
    include
});
```

### 6.4 Partial Updates — تحديث جزئي

```js
// بدل ما نبعت كل الحقول — بنبعت بس اللى اتغير
const updateData = {};
if (name !== undefined) updateData.name = name;
if (bio !== undefined) updateData.bio = bio;
if (areaId !== undefined) updateData.areaId = areaId;

await prisma.teacher.update({
    where: { id: teacherId },
    data: updateData
});
```

📄 **شوف:**
- [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — `updateMyProfile`
- [auth.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/auth.controller.js) — `updateProfile`

### 6.5 Unique Constraints — منع التكرار ودورة معالجة الأخطاء (Error Flow) 🔄

```prisma
model Favorite {
    parentId  String
    teacherId String
    @@unique([parentId, teacherId])  // مش ممكن نفس العميل يفضل نفس المدرس مرتين
}
```

#### 🔄 دورة معالجة خطأ الداتابيز حتى وصوله للـ UI (Database to Frontend Error Flow):

حلقة الوصل بين أخطاء قاعدة البيانات وما يظهر للمستخدم في الواجهة الأمامية تتم بالشكل التالي:

```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│  Database (Neon)       │      │  Express API Server    │      │  Frontend (Zustand)    │
├────────────────────────┤      ├────────────────────────┤      ├────────────────────────┤
│   Prisma Error P2002   │ ───→ │  Global Error Handler  │ ───→ │   useStore error catch │
│  (Unique constraint)   │      │  maps to 409 Conflict  │      │   and extractError()   │
└────────────────────────┘      └────────────────────────┘      └───────────┬────────────┘
                                                                            │
                                                                            ▼
                                                                ┌────────────────────────┐
                                                                │  React UI Page Component│
                                                                │  ErrorBanner or Form   │
                                                                │  Validation display    │
                                                                └────────────────────────┘
```

##### 1. على مستوى قاعدة البيانات (Prisma Level):
عند محاولة إضافة نفس المدرس للمفضلة مرتين، أو تسجيل رقم هاتف مستخدم مسجل مسبقاً، يلقي Prisma خطأ بكود `P2002`.

##### 2. على مستوى السيرفر (Express API Level):
الـ Global Error Middleware في السيرفر [error.js](file:///Users/sayed/Devs/Zads/zads-api/src/middlewares/error.js) يلتقط أخطاء Prisma ويقوم بعمل Mapping لها:
```js
if (err.code === 'P2002') {
    // استخراج الحقل الذي سبب المشكلة وإرجاعه كرسالة واضحة
    const field = err.meta?.target?.[0] || 'field';
    return ApiResponse.error(res, `${field} already exists`, 409); // 409 Conflict
}
```

##### 3. على مستوى الـ Frontend (Zustand Store Level):
عند استدعاء الـ API من الـ Frontend، تقوم الـ Store بالتقاط الـ Response وتحليل الأخطاء عبر `extractError`:
```ts
// src/stores/favorites.ts
addFavorite: async (teacherId) => {
    try {
        await apiPost("/favorites", { teacherId });
        // نجاح العملية...
    } catch (err) {
        // extractError يستخرج الرسالة "already exists" من الـ API response
        set({ error: extractError(err) });
    }
}
```

##### 4. على مستوى واجهة المستخدم (React UI Level):
تقوم الصفحة بقراءة حالة الخطأ من الـ Store وعرضها للمستخدم بطريقة مقروءة وجميلة:
```tsx
const { error, addFavorite } = useFavoritesStore();

// عرض بانر خطأ عام في الصفحة
{error && <ErrorBanner message={error} />}

// أو في الـ Form عند التسجيل برقم مكرر، نربطه بالـ react-hook-form:
setError("phone", { 
    type: "manual", 
    message: t("errors.phone_exists") // رسالة مترجمة للمستخدم
});
```


### 6.6 Cascade Deletes — حذف متسلسل

```prisma
model ParentChild {
    parentId String
    parent   Parent @relation(fields: [parentId], references: [id], onDelete: Cascade)
    // لما الـ parent يتحذف → كل أولاده يتحذفوا تلقائياً
}
```

---

## 📦 المرحلة 7: Neon — استضافة سحابية

> **الهدف:** تفهم ازاي الداتابيز مستضافة في الإنتاج.

### 7.1 ايه هو Neon؟

**Neon** هو **Serverless PostgreSQL** — يعني:
- ✅ مش لازم تدير سيرفر — هما بيديروه
- ✅ **Scale to zero** — لما مفيش traffic بيقفل (مش بيدفع)
- ✅ **Auto-scaling** — بيكبر تلقائياً لما الترافيك يزيد
- ✅ **Branching** — بتقدر تعمل نسخة من الداتابيز للتطوير

### 7.2 Connection Strings — روابط الاتصال

```env
# Pooled URL — لحركة التطبيق العادية
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/zads?sslmode=require"

# Direct URL — للـ migrations (بدون pool)
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/zads?sslmode=require"
```

**ليه اتنين URLs؟**
| | Pooled (DATABASE_URL) | Direct (DIRECT_URL) |
|-|----------------------|---------------------|
| **الاستخدام** | التطبيق (queries عادية) | Migrations (DDL) |
| **Connection Pool** | ✅ نعم (PgBouncer) | ❌ لا |
| **Performance** | أفضل للـ app | مطلوب للـ schema changes |
| **في Prisma** | `url` | `directUrl` |

📄 **شوف الإعداد:**
- [prisma.config.ts](file:///Users/sayed/Devs/Zads/zads-api/prisma.config.ts) — إعدادات الاتصال

### 7.3 الاتصال من Prisma

```prisma
datasource db {
    provider  = "postgresql"
    url       = env("DATABASE_URL")      // pooled — للتطبيق
    directUrl = env("DIRECT_URL")        // direct — للـ migrations
}
```

### 7.4 نصائح للتعامل مع Neon

1. **Connection Timeout** — Neon ممكن ياخد وقت لـ "wake up" بعد فترة سكون.
2. **SSL Required** — لازم `sslmode=require` في الـ URL.
3. **Pooling** — استخدم pooled URL للتطبيق عشان الأداء.
4. **Migrations** — لازم direct URL عشان الـ pooler مش بيدعم DDL.
5. **Cold Starts & CI/CD Pipelines 🛑**
   بما أن Neon داتابيز Serverless، فإنها تدخل في وضع السكون (Scale to zero) لتوفير التكلفة عند انقطاع الترافيك.
   * **المشكلة:** عند بدء الـ CI/CD Pipeline (مثل GitHub Actions) بعد فترة خمول لتشغيل الـ Migrations (`prisma migrate deploy`) أو الـ Seeds، قد يتأخر الـ connection وتفشل العملية بـ Timeout.
   * **الحل:** قم بزيادة مهلة الاتصال في الـ connection string الخاص بالـ direct URL عن طريق إضافة بارامترات التحكم بالوقت:
     `DIRECT_URL="postgresql://.../zads?sslmode=require&connect_timeout=30"`
     أو وضع سكريبت انتظار/إحماء بسيط (Warm-up ping) في الـ pipeline قبل تشغيل الـ migrations للتأكد من استيقاظ قاعدة البيانات تماماً!


---

## ✅ تمارين عملية

### تمرين 1: اقرأ الـ Schema كامل
1. افتح [schema.prisma](file:///Users/sayed/Devs/Zads/zads-api/prisma/schema.prisma)
2. ارسم خريطة العلاقات على ورقة
3. حدد كل الـ one-to-one, one-to-many, many-to-many

### تمرين 2: تتبع Query كامل
1. افتح [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — `searchTeachers`
2. اكتب الـ SQL query المكافئ يدوياً
3. قارن بين Prisma syntax و SQL

### تمرين 3: شغّل الـ Seed
```bash
cd zads-api
pnpm run db:seed
```
1. شوف البيانات اللى اتضافت
2. جرب تضيف مادة جديدة في [seed.js](file:///Users/sayed/Devs/Zads/zads-api/prisma/seed.js)
3. شغل الـ seed تاني وشوف

### تمرين 4: عدل الـ Schema
1. أضف حقل جديد في model (مثلاً `websiteUrl` في `Teacher`)
2. شغل `pnpm run db:migrate` — شوف الـ migration اللى اتولد
3. شغل `pnpm run db:generate` — شوف الـ client اتحدث
4. استخدم الحقل الجديد في controller

### تمرين 5: Prisma Studio
```bash
cd zads-api
npx prisma studio
```
- ده بيفتح واجهة رسومية للداتابيز في المتصفح
- تقدر تشوف كل الجداول والبيانات
- تقدر تضيف/تعدل/تحذف بيانات يدوياً

---

## 📚 مراجع إضافية

| المورد | الرابط |
|--------|--------|
| Prisma Docs | https://www.prisma.io/docs |
| PostgreSQL Tutorial | https://www.postgresqltutorial.com |
| Neon Docs | https://neon.tech/docs |
| SQL Playground | https://www.db-fiddle.com |

---

## 🎉 مبروك!

لو وصلت لحد هنا يبقى انت فهمت:
- ✅ **Next.js & React** — الواجهة الأمامية
- ✅ **Express.js & Node.js** — السيرفر
- ✅ **PostgreSQL & Prisma** — قاعدة البيانات

الخطوة الجاية: 🚀 [04-platform-now.md](./04-platform-now.md) — الاكتشاف العام، والخصوصية، والتحليلات، وإزاي التطبيق بيكلم الـ API دلوقتي.

</div>

