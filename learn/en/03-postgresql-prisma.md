# 📘 PostgreSQL & Prisma Learning Roadmap — from the Zads Project


> **Level:** From scratch to a complete understanding of the database structure
> **On the fullstack path:** days 13–19 only (14 hours). The calendar is [00-fullstack-path.md](./00-fullstack-path.md).
> **Video for these days:** [SQL in 60 minutes](https://www.youtube.com/watch?v=p3qvj9hO_Bo), then the keys, joins, and constraints parts of [PostgreSQL — freeCodeCamp](https://www.youtube.com/watch?v=SpfIwlAYaKk). Drills: [pgexercises.com](https://pgexercises.com/).
> **Method:** Each topic contains an explanation + link to a real file in the project

<blockquote dir="rtl">

*الـ Database هي قلب المشروع، وفي الملف ده هنتعلم إزاي بنهندل البيانات باستعمال بريزما ومحرك الداتابيز الموثوق بوستجرس.*

</blockquote>

---

## 🗺️ The Complete Roadmap

```
Phase 1: Database Basics ← (Week 1)
    │
    ▼
Phase 2: Prisma Schema — Defining Structure ← (Week 1)
    │
    ▼
Phase 3: Relationships Between Tables ← (Week 1-2)
    │
    ▼
Phase 4: Prisma Client — Interacting with Data ← (Week 2)
    │
    ▼
Phase 5: Migrations — Managing Schema Changes ← (Week 2-3)
    │
    ▼
Phase 6: Advanced Patterns ← (Week 3)
    │
    ▼
Phase 7: Neon — Cloud Hosting ← (Week 3)
```

<blockquote dir="rtl">

*التقسيمة دي هتاخدك من البدايات لحد ما تبقى فنان في عمل الـ database migrations والـ complex queries.*

</blockquote>

---

## 📦 Phase 1: Database Basics

> **Goal:** Understand what a database is and why we use it.
<blockquote dir="rtl">

*قاعدة البيانات هي مخزن منظم لحفظ البيانات، وفكرتها شبه جداول إكسيل بس مترابطة ببعض بذكاء.*

</blockquote>

### 1.1 What is a Relational Database?

Think of it as **interconnected Excel sheets**:

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

**Core Concepts:**

| Concept | Meaning | Example |
|---------|---------|---------|
| **Table** | Collection of data of the same type | `users`, `teachers` |
| **Row** | A single record | A single user |
| **Column** | A property / field | `name`, `phone`, `status` |
| **Primary Key (PK)** | Unique identifier for each row | `id` (UUID) |
| **Foreign Key (FK)** | Reference linking to another table | `userId` in `teachers` refers to `users` |
| **Index** | Search index for high performance | Indexing the `phone` column |

### 1.2 Why PostgreSQL?

| Feature | Explanation |
|---------|-------------|
| **Reliable** | 35+ years of active development, trusted by top tech firms |
| **Relational** | Relationships are strictly enforced and structured |
| **JSON Support** | Supports JSON storage (used in `lessonTypes`) |
| **ACID** | Operations are atomic; they either fully succeed or roll back |
| **Free & Open Source** | Free to use with zero licensing costs |

### 1.3 What is Prisma?

Prisma is an **ORM (Object-Relational Mapping)** — allowing database interactions using JavaScript instead of SQL:

```
بدون ORM (SQL):
  SELECT * FROM users WHERE phone = '01012345678';
 
مع Prisma (JavaScript):
  const user = await prisma.user.findFirst({ where: { phone: '01012345678' } });
```

**Benefits of Prisma:**
- ✅ **Type-safe** — TypeScript knows exactly what fields exist.
- ✅ **Schema-first** — Define structure once, it handles the rest.
- ✅ **Migrations** — Tracks database structure changes.
- ✅ **Auto-completion** — IDE autocompletes queries.

<blockquote dir="rtl">

*بريزما ORM ده حبيب المطورين، بيكتبلك كود SQL المحايد وراء الكواليس وبيخليك تكتب كود جافا سكريبت نضيف جداً.*

</blockquote>

---

## 📦 Phase 2: Prisma Schema — Defining Structure

> **Goal:** Understand how the database schema is defined in Prisma.
<blockquote dir="rtl">

*ملف schema.prisma هو خريطة الأرض بتاعة قواعد البيانات، أي جدول أو علاقة بتتولد من الملف ده.*

</blockquote>

### 2.1 The Schema File

📄 **Open and read:**
- [schema.prisma](file:///Users/sayed/Devs/Zads/zads-api/prisma/schema.prisma) — **The most important database file!**

**The schema consists of 3 parts:**

#### Part 1: Connection Configurations
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

#### Part 2: Enums
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

> **Why Enums?** To restrict allowed values — preventing invalid entries like `userType = "hacker"`.

#### Part 3: Models
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

### 2.2 Understanding Symbols in Prisma Schema

| Symbol | Meaning | Example |
|--------|---------|---------|
| `@id` | Primary Key | `id String @id` |
| `@default(uuid())` | Automatic UUID default value | Unique identifier |
| `@default(now())` | Current timestamp | `createdAt` |
| `@unique` | Enforce unique values | `phone @unique` |
| `@map("name")` | Column name in the database | `passwordHash @map("password_hash")` |
| `@@map("name")` | Table name in the database | `@@map("users")` |
| `?` | Nullable / optional field | `email String?` |
| `@updatedAt` | Auto-updates on modification | `updatedAt DateTime @updatedAt` |
| `@default(active)` | Default value from enum | `status @default(active)` |
| `@@unique([a, b])` | Composite unique constraint | `@@unique([parentId, teacherId])` |

<blockquote dir="rtl">

*الرموز دي بتشكل القيود (constraints) اللي بتمنع حدوث أخطاء فادحة في دمج أو تكرار البيانات.*

</blockquote>

### 2.3 The 19 Models in Zads

📄 **All located in:** [schema.prisma](file:///Users/sayed/Devs/Zads/zads-api/prisma/schema.prisma)

#### User Models (Core):

```
┌─────────┐     ┌──────────┐     ┌──────────┐
│  User   │────→│ Teacher  │     │  Parent  │
│         │────→│          │     │          │
│ الأساس  │     │ بيانات   │     │ بيانات   │
│         │     │ المدرس   │     │ العميل   │
└─────────┘     └──────────┘     └──────────┘
```

| Table | Purpose | Important Fields |
|-------|---------|------------------|
| `User` | Base user model | phone, email, name, userType, status |
| `Teacher` | Extra tutor details | bio, experience, rating, views, isVerified |
| `Parent` | Extra client/parent details | clientAccountKind (student/guardian) |

#### Children & Subjects:

```
┌──────────┐     ┌─────────────┐     ┌─────────────────┐
│  Parent  │────→│ ParentChild │────→│ParentChildSubject│
│          │     │ (الولد)      │     │ (مواد الولد)     │
└──────────┘     └─────────────┘     └─────────────────┘
```

| Table | Purpose |
|-------|---------|
| `ParentChild` | Parent's children (name, educational stage, school type) |
| `ParentChildSubject` | Connects a child to their specific study subjects |

#### Subjects & Stages:

| Table | Purpose | Details |
|-------|---------|---------|
| `Subject` | School study subjects | Mathematics, Arabic, English, etc. (18 subjects) |
| `Stage` | Educational stages | Primary, Preparatory, Secondary, University |
| `TeacherSubject` | Tutors' pricing per subject | Tying tutor, subject, stage with 6 distinct prices |

#### Locations:

```
┌──────────────┐     ┌─────────┐     ┌─────────┐
│ Governorate  │────→│  City   │────→│  Area   │
│ (محافظة)     │     │ (مدينة) │     │ (منطقة) │
└──────────────┘     └─────────┘     └─────────┘
```

| Table | Purpose |
|-------|---------|
| `Governorate` | Egyptian governorates |
| `City` | Cities inside each governorate |
| `Area` | Areas / Districts inside each city |

#### Interactions:

| Table | Purpose |
|-------|---------|
| `Favorite` | Parents' favorite tutors list |
| `ContactRequest` | Tutoring contact requests between a parent and tutor |
| `TutorRequest` | General "I need a tutor" public job posts |
| `Comparison` | Comparisons list |
| `ComparisonItem` | Tutors added inside a comparison list |
| `TeacherAvailability` | Weekly schedule slot preferences for tutors |
| `WhatsAppClick` | Analytics click tracker for WhatsApp redirect links |
| `PlatformEvent` | First-party funnel and attribution events (`eventType`, `sessionId`, `dedupKey`) |

`ContactRequest` also stores `studyMode`, `teachingPlace`, `preferredTime`, `replyMessage`, `initiatedBy`, `tutorRequestId`, and `idempotencyKey`. Phone numbers stay hidden until the request is `accepted`. See [04-platform-now.md](./04-platform-now.md).

<blockquote dir="rtl">

*زاد بيدير 19 موديل مترابطين. آخرهم `PlatformEvent` لأحداث التحليلات جوا الداتابيز.*

</blockquote>

---

## 📦 Phase 3: Relationships Between Tables

> **Goal:** Understand the types of relationships and how tables connect.
<blockquote dir="rtl">

*العلاقات دي هي اللي بتخلي قاعدة البيانات علائقية بجد، وبتربط الجداول ببعض عشان نجيب البيانات بـ query واحدة.*

</blockquote>

### 3.1 One-to-One

**Example:** Every `User` can have at most one `Teacher` profile.

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

📄 **Check in schema:**
- `User` ↔ `Teacher` (Lines 30-40 approximately).
- `User` ↔ `Parent`.

### 3.2 One-to-Many

**Example:** Every `Parent` can have multiple `ParentChild` records.

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

📄 **Check in schema:**
- `Parent` → `ParentChild[]`.
- `Governorate` → `City[]` → `Area[]`.
- `Teacher` → `TeacherSubject[]`.

### 3.3 Many-to-Many

**Example:** A tutor teaches many subjects, and a subject is taught by many tutors.
In Prisma, we use a **junction table**:

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

📄 **Check in schema:**
- `TeacherSubject` — Junction between `Teacher` and `Subject`.
- `ParentChildSubject` — Junction between `ParentChild` and `Subject`.
- `Favorite` — Connection between `Parent` and `Teacher`.

### 3.4 Self-referencing & Composite Keys

```prisma
model Favorite {
    id        String  @id @default(uuid())
    parentId  String  @map("parent_id")
    teacherId String  @map("teacher_id")
 
    // ده بيمنع نفس العميل يفضل نفس المدرس مرتين
    @@unique([parentId, teacherId])
}
```

### 3.5 Entity Relationship Diagram

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
 │  nameAr      │     │  nameAr      │
 │  nameEn      │     │  nameEn      │
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

#### 📊 Interactive Mermaid Core ERD:

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

<blockquote dir="rtl">

*الـ ERD ده بيلخص العلاقات الأساسية، وهي الطريقة اللي بنربط بيها المدرس بالمادة وبالطالب وبالموقع الجغرافي.*

</blockquote>

---

## 📦 Phase 4: Prisma Client — Interacting with Data

> **Goal:** Understand how to read and write database records.
<blockquote dir="rtl">

*بريزما كلاينت هو الأداة اللي بنستخدمها جوة كود الباك إند عشان نبعت الاستعلامات (Queries) للداتابيز بكل أمان.*

</blockquote>

### 4.1 Configuring the Prisma Client

📄 **Check:**
- [database.js](file:///Users/sayed/Devs/Zads/zads-api/src/config/database.js) — Prisma Client singleton.

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

**Why Singleton?** To prevent opening too many concurrent connections to the database, sharing a single pool instead.

### 4.2 Core CRUD Operations

#### Create:
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

📄 **Check:** [auth.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/auth.controller.js) — `register` function.

#### Read:
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

📄 **Check:** [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — `searchTeachers` function.

#### Update:
```js
const updated = await prisma.teacher.update({
    where: { id: teacherId },
    data: { bio: 'مدرس رياضيات متميز' }
});
```

📄 **Check:** [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — `updateMyProfile`.

#### Delete:
```js
await prisma.favorite.delete({
    where: { id: favoriteId }
});
 
// أو حذف بشرط مركب
await prisma.favorite.deleteMany({
    where: { parentId, teacherId }
});
```

📄 **Check:** [favorites.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/favorites.controller.js) — `removeFavorite`.

### 4.3 Include — Fetching Relations

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
```

📄 **Check complex includes:**
- [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — `getTeacherById` — largest relation include.
- [auth.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/auth.controller.js) — `getProfile` — dynamic include based on `userType`.

<blockquote dir="rtl">

*الـ `include` دي زي الـ JOIN في الـ SQL العادي، بتجيبلك الداتا المترابطة معاك في نفس الضربة.*

</blockquote>

### 4.4 Where — Query Conditions

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

**Comparison Operators:**
| Operator | Meaning | Example |
|----------|---------|---------|
| `equals` | Equal to | `{ rating: { equals: 5 } }` |
| `not` | Not equal to | `{ status: { not: 'suspended' } }` |
| `gt` | Greater than | `{ experience: { gt: 3 } }` |
| `gte` | Greater than or equal to | `{ rating: { gte: 4 } }` |
| `lt` | Less than | `{ price: { lt: 200 } }` |
| `lte` | Less than or equal to | `{ price: { lte: 150 } }` |
| `contains` | Contains substring | `{ name: { contains: 'Ahmed' } }` |
| `in` | Inside a list / array | `{ id: { in: ['a', 'b', 'c'] } }` |

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
```

<blockquote dir="rtl">

*استخدم الـ `select` لما تكون عايز ترجع حقول معينة بس (زي الاسم والموبايل) عشان توفر رامات وباندويدث.*

</blockquote>

### 4.6 Transactions

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
```

📄 **Check:**
- [auth.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/auth.controller.js) — `register` — transaction creating user + role profile.
- [parents.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/parents.controller.js) — `addChild` — transaction creating child + subjects + tutor requests.

### 4.7 Aggregation

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
```

📄 **Check:**
- [admin.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/admin.controller.js) — `getDashboardStats` — statistics aggregations.

---

## 📦 Phase 5: Migrations — Managing Schema Changes

> **Goal:** Understand how to modify the database structure safely.
<blockquote dir="rtl">

*الـ Migrations هي الهستوري بتاع الداتابيز، كل تعديل في الجداول بيتسجل في ملفات SQL عشان نقدر نطبقها في البرودكشن بأمان.*

</blockquote>

### 5.1 What are Migrations?

A migration is a **SQL script file describing the database change** — like Git commits for your database:

```
Migration 1: Initial schema generation
    │ CREATE TABLE users (...)
    │ CREATE TABLE teachers (...)
    ▼
Migration 2: Adding location models
    │ CREATE TABLE governorates (...)
    │ CREATE TABLE cities (...)
    ▼
Migration 3: Adding children model
    │ CREATE TABLE parent_children (...)
    ▼
... and so on
```

### 5.2 Migrations in the Project

📄 **Check:**
- [migrations/](file:///Users/sayed/Devs/Zads/zads-api/prisma/migrations) — Contains all migrations.

| Migration | Date | Description |
|-----------|------|-------------|
| `20251226124027_zads` | 26/12/2025 | Core baseline database structure |
| `20251227021545_add_locations` | 27/12/2025 | Governorate, City, and Area tables |
| `20251227104301_add_parent_children` | 27/12/2025 | Parent children tables |
| `20251227113221_add_tutor_request_area` | 27/12/2025 | Adding area field to tutor requests |
| `20260425000000_platform_evolution` | 25/04/2026 | Study modes + client accounts features |
| `20260518194436_init` | 18/05/2026 | Baseline reconsolidated migrations reset |

### 5.3 Migration Commands

```bash
# 1. تطوير — إنشاء migration جديد
pnpm run db:migrate
# = prisma migrate dev
 
# 2. إنتاج — تنفيذ migrations موجودة
pnpm run db:migrate:prod
# = prisma migrate deploy
 
# 3. توليد Prisma Client
pnpm run db:generate
# = prisma generate
 
# 4. تعبئة بيانات أولية
pnpm run db:seed
# = node prisma/seed.js
```

### 5.4 Seed Data

📄 **Check:**
- [seed.js](file:///Users/sayed/Devs/Zads/zads-api/prisma/seed.js) — Seeding script.
- [locations-data.js](file:///Users/sayed/Devs/Zads/zads-api/prisma/locations-data.js) — Raw Egypt locations data (47KB).

**The seed script sets up:**
1. **18 main study subjects**.
2. **4 core educational stages**.
3. **Complete geographical map of Egypt** (all Governorates → Cities → Areas).
4. **Default admin user** — phone number: 01000000000.

```js
await prisma.subject.upsert({
    where: { id: 'math-uuid' },
    update: {},  // لو موجود مش بيتغير
    create: { id: 'math-uuid', nameAr: 'الرياضيات', nameEn: 'Mathematics' }
});
```

### 5.5 Prisma Config

📄 **Check:**
- [prisma.config.ts](file:///Users/sayed/Devs/Zads/zads-api/prisma.config.ts) — Connection pooling configs.

```ts
// DIRECT_URL represents the direct unpooled connection used for Migrations.
// This is because transaction poolers (PgBouncer) do not support DDL statements.
```

<blockquote dir="rtl">

*الـ seed ده هو اللي بيملا الداتابيز الفاضية بالبيانات الأساسية عشان لما تشغل المشروع لأول مرة تلاقي المواد والمناطق جاهزة.*

</blockquote>

---

## 📦 Phase 6: Advanced Patterns

> **Goal:** Understand professional patterns in database management.
<blockquote dir="rtl">

*هنا بقى الحركات الصعبة اللي بتسهل تصفح البيانات وفلترتها ديناميكياً.*

</blockquote>

### 6.1 Dynamic Query Building

```js
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

📄 **Check:**
- [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — `searchTeachers` dynamic queries.

### 6.2 Pagination Pattern

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

### 6.3 Conditional Includes

```js
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

### 6.4 Partial Updates

```js
const updateData = {};
if (name !== undefined) updateData.name = name;
if (bio !== undefined) updateData.bio = bio;
if (areaId !== undefined) updateData.areaId = areaId;
 
await prisma.teacher.update({
    where: { id: teacherId },
    data: updateData
});
```

### 6.5 Unique Constraints & Database to Frontend Error Flow 🔄

```prisma
model Favorite {
    parentId  String
    teacherId String
    @@unique([parentId, teacherId])  // مش ممكن نفس العميل يفضل نفس المدرس مرتين
}
```

#### 🔄 Database to Frontend Error Flow:

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

##### 1. Database Level (Prisma Level):
When trying to add duplicate favorite items or register duplicate phone numbers, Prisma throws a `P2002` error.

##### 2. Server Level (Express API Level):
The Global Error Middleware in [error.js](file:///Users/sayed/Devs/Zads/zads-api/src/middlewares/error.js) catches this and maps it:
```js
if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return ApiResponse.error(res, `${field} already exists`, 409); // 409 Conflict
}
```

##### 3. Frontend Level (Zustand Store Level):
The Frontend store catches the error in `extractError`:
```ts
// src/stores/favorites.ts
addFavorite: async (teacherId) => {
    try {
        await apiPost("/favorites", { teacherId });
    } catch (err) {
        set({ error: extractError(err) });
    }
}
```

##### 4. User Interface Level (React UI Level):
The page renders the error via `ErrorBanner` or links it to form validation:
```tsx
const { error, addFavorite } = useFavoritesStore();
{error && <ErrorBanner message={error} />}
```

<blockquote dir="rtl">

*الـ Flow ده بيضمن إن أي مشكلة في الداتابيز تظهر لليوزر كرسالة واضحة بالعربي أو الإنجليزي من غير ما السيرفر يقع.*

</blockquote>

### 6.6 Cascade Deletes

```prisma
model ParentChild {
    parentId String
    parent   Parent @relation(fields: [parentId], references: [id], onDelete: Cascade)
    // لما الـ parent يتحذف → كل أولاده يتحذفوا تلقائياً
}
```

---

## 📦 Phase 7: Neon — Cloud Hosting

> **Goal:** Understand how the database is hosted in production.
<blockquote dir="rtl">

*نيون بيقدملك داتابيز بوستجرس سحابية سيرفرليس، بتكبر وبتصغر مع الترافيك ومبتدفعش مليم طول ما مفيش زيارات.*

</blockquote>

### 7.1 What is Neon?

**Neon** is a **Serverless PostgreSQL** service:
- ✅ **No server administration** required.
- ✅ **Scale to zero** — spins down when idle (zero cost).
- ✅ **Auto-scaling** — scales computing power seamlessly as traffic surges.
- ✅ **Branching** — instantly branch your database like Git branches for testing.

### 7.2 Connection Strings

```env
# Pooled URL — normal runtime
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/zads?sslmode=require"
 
# Direct URL — migrations (no pool)
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/zads?sslmode=require"
```

| Feature | Pooled (DATABASE_URL) | Direct (DIRECT_URL) |
|---------|----------------------|---------------------|
| **Usage** | Normal app queries | Migrations (DDL) |
| **Connection Pool** | ✅ Yes (PgBouncer) | ❌ No |
| **Performance** | Faster for high traffic | Required for DDL schema alterations |
| **In Prisma** | `url` | `directUrl` |

📄 **Check config:**
- [prisma.config.ts](file:///Users/sayed/Devs/Zads/zads-api/prisma.config.ts) — Connection setup.

### 7.3 Connecting from Prisma

```prisma
datasource db {
    provider  = "postgresql"
    url       = env("DATABASE_URL")      // pooled — للتطبيق
    directUrl = env("DIRECT_URL")        // direct — للـ migrations
}
```

### 7.4 Tips for working with Neon

1. **Connection Timeout** — Neon might take a few seconds to "wake up" (cold start) from sleep.
2. **SSL Required** — `sslmode=require` parameter must be in connection strings.
3. **Pooling** — Always use pooled URLs for the application runtime.
4. **Migrations** — Use direct URLs for migrations.
5. **Cold Starts & CI/CD Pipelines 🛑**
   Since Neon enters hibernation when idle, pipeline migrations (`prisma migrate deploy`) or seeding runs in GitHub Actions might timeout.
   * **Problem:** Cold start latency on pipelines.
   * **Solution:** Append timeout parameters:
     `DIRECT_URL="postgresql://.../zads?sslmode=require&connect_timeout=30"`
     Or trigger a simple warm-up ping inside the pipeline before starting migrations!

<blockquote dir="rtl">

*موقع نيون ممتاز وبيريحنا من إدارة السيرفرات، بس خلي بالك دايمًا تزود مهلة الـ timeout في الـ pipeline عشان الـ cold start.*

</blockquote>

---

## ✅ Practical Exercises

### Exercise 1: Read the Whole Schema
1. Open [schema.prisma](file:///Users/sayed/Devs/Zads/zads-api/prisma/schema.prisma).
2. Trace the relationships.
3. Identify all one-to-one, one-to-many, and many-to-many relationships.

### Exercise 2: Trace a Query
1. Open [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — `searchTeachers`.
2. Write down the equivalent raw SQL statement.
3. Compare Prisma syntax and SQL syntax.

### Exercise 3: Run the Seed
```bash
cd zads-api
pnpm run db:seed
```
1. Observe the generated rows.
2. Add a test subject inside [seed.js](file:///Users/sayed/Devs/Zads/zads-api/prisma/seed.js).
3. Run the seed script again and check.

### Exercise 4: Modify the Schema
1. Add a new field to a model (e.g., `websiteUrl` inside `Teacher`).
2. Run `pnpm run db:migrate` and watch the generated migration SQL file.
3. Run `pnpm run db:generate` to regenerate the Prisma client.
4. Utilize the new field in a controller.

### Exercise 5: Prisma Studio
```bash
cd zads-api
npx prisma studio
```
- This launches a beautiful visual database explorer in your browser.
- Browse, edit, and delete rows visually.

<blockquote dir="rtl">

*الـ Prisma Studio ده سحر بجد، بيخليك تشوف بيانات الداتابيز وتعدل فيها كأنك شغال على شيت إكسيل.*

</blockquote>

---

## 📚 Additional Resources

| Resource | URL |
|----------|-----|
| Prisma Docs | https://www.prisma.io/docs |
| PostgreSQL Tutorial | https://www.postgresqltutorial.com |
| Neon Docs | https://neon.tech/docs |
| SQL Playground | https://www.db-fiddle.com |

---

## 🎉 Congratulations!

If you reached this point, you have mastered:
- ✅ **Next.js & React** — Frontend.
- ✅ **Express.js & Node.js** — Backend Server.
- ✅ **PostgreSQL & Prisma** — Relational Database.

Next: 🚀 [04-platform-now.md](./04-platform-now.md) — public discovery, privacy, analytics, and how the app talks to the API today.
