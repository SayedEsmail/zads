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

# 📙 خريطة تعلم Express.js و Node.js — من مشروع Zads



> **المستوى:** من الصفر حتى فهم كامل لكود الـ API
> **الوقت المتوقع:** 3-4 أسابيع (ساعتين يومياً)
> **الطريقة:** كل موضوع فيه شرح + رابط لملف حقيقي من المشروع

---

## 🗺️ الخريطة الكاملة

```
المرحلة 1: أساسيات Node.js ← (أسبوع 1)
    │
    ▼
المرحلة 2: Express.js — الإطار ← (أسبوع 1-2)
    │
    ▼
المرحلة 3: Middleware — الوسائط ← (أسبوع 2)
    │
    ▼
المرحلة 4: Routing & Controllers ← (أسبوع 2-3)
    │
    ▼
المرحلة 5: المصادقة والأمان ← (أسبوع 3)
    │
    ▼
المرحلة 6: التحقق من البيانات ← (أسبوع 3-4)
    │
    ▼
المرحلة 7: أنماط متقدمة ← (أسبوع 4)
```

---

---

## 📦 المرحلة 1: أساسيات Node.js

> **الهدف:** تفهم Node.js وازاي بيشتغل قبل ما تبدأ Express.

### 1.1 ايه هو Node.js؟

Node.js هو **runtime** بيسمحلك تشغل JavaScript على السيرفر (مش في المتصفح بس):

| المتصفح (Browser) | Node.js (Server) |
|-------------------|------------------|
| `document`, `window` | `process`, `fs`, `path` |
| يعرض واجهات | يتعامل مع ملفات، قواعد بيانات، شبكات |
| يستقبل أحداث المستخدم | يستقبل HTTP requests |

### 1.2 الـ Modules — تنظيم الكود

في Node.js، كل ملف هو **module** مستقل:

```js
// ✅ Export
module.exports = { myFunction };
// أو
export default myFunction;
// أو
export { myFunction, myVariable };

// ✅ Import
const { myFunction } = require('./myFile');
// أو
import { myFunction } from './myFile';
```

📄 **شوف في المشروع:**
- [env.js](file:///Users/sayed/Devs/Zads/zads-api/src/config/env.js) — بيعمل export لمتغيرات البيئة
- [database.js](file:///Users/sayed/Devs/Zads/zads-api/src/config/database.js) — بيعمل export لـ Prisma client

### 1.3 الـ `package.json` — ملف المشروع

📄 **شوف:**
- [package.json](file:///Users/sayed/Devs/Zads/zads-api/package.json) — لاحظ:

| القسم | الغرض |
|-------|-------|
| `scripts` | أوامر التشغيل: `dev`, `start`, `db:migrate` |
| `dependencies` | المكتبات المطلوبة في الإنتاج |
| `devDependencies` | المكتبات المطلوبة في التطوير فقط (nodemon) |

**أهم الأوامر:**
```bash
pnpm run dev          # تشغيل السيرفر مع nodemon (auto-restart)
pnpm run start        # تشغيل السيرفر في الإنتاج
pnpm run db:migrate   # تشغيل migrations
pnpm run db:generate  # توليد Prisma client
pnpm run db:seed      # تعبئة الداتابيز ببيانات أولية
```

### 1.4 Environment Variables — متغيرات البيئة

```js
// بنستخدم dotenv عشان نقرأ من ملف .env
require('dotenv').config();

// بعدين بنستخدم process.env
const port = process.env.PORT || 3000;
const secret = process.env.JWT_SECRET;
```

📄 **شوف:**
- [env.js](file:///Users/sayed/Devs/Zads/zads-api/src/config/env.js) — بيجمع كل المتغيرات في مكان واحد
- [.env.example](file:///Users/sayed/Devs/Zads/zads-api/.env.example) — المتغيرات المطلوبة

---

## 📦 المرحلة 2: Express.js — الإطار

> **الهدف:** تفهم ازاي Express بيشتغل وايه الـ request/response cycle.

### 2.1 ايه هو Express.js؟

Express هو **web framework** لـ Node.js — أبسط طريقة لعمل API server:

```js
const express = require('express');
const app = express();

// تعريف route
app.get('/hello', (req, res) => {
    res.json({ message: 'Hello World!' });
});

// تشغيل السيرفر
app.listen(3000, () => console.log('Server running on port 3000'));
```

### 2.2 نقطة الدخول — `app.js`

📄 **شوف:**
- [app.js](file:///Users/sayed/Devs/Zads/zads-api/src/app.js) — **الملف الأهم — ابدأ بده**

**الترتيب في `app.js` مهم جداً:**

```
1. Imports (المكتبات والملفات)
    ↓
2. Express app creation (إنشاء التطبيق)
    ↓
3. Global middleware (وسائط عامة)
    │ ├── helmet()          ← أمان
    │ ├── cors()            ← السماح بالطلبات من مواقع تانية
    │ ├── morgan()          ← تسجيل الطلبات
    │ ├── express.json()    ← قراءة JSON body
    │ └── express.static()  ← ملفات ثابتة (uploads)
    ↓
4. Route mounting (ربط المسارات)
    │ ├── /api/auth         → authRoutes
    │ ├── /api/teachers     → teacherRoutes
    │ ├── /api/parents      → parentRoutes
    │ └── ... (13 route file)
    ↓
5. Health check endpoint
    ↓
6. Error handler (التعامل مع الأخطاء)
    ↓
7. Server start (تشغيل السيرفر)
```

**لاحظ في الكود:**
```js
// Global middleware
app.use(helmet());                              // أمان
app.use(cors({ origin: process.env.CORS_ORIGIN }));  // CORS
app.use(morgan(isProduction ? 'combined' : 'dev'));   // Logging
app.use(express.json());                        // JSON parsing
app.use('/uploads', express.static('public/uploads')); // Static files

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
// ...

// Error handler — لازم يكون آخر حاجة
app.use(errorHandler);
```

### 2.3 Request & Response — الطلب والرد

كل HTTP request بيمر بالمراحل دي:

```
Client (Browser/App)
    │
    │ HTTP Request (GET /api/teachers/search?subject=math)
    ▼
Express Server
    │
    ├── 1. Global Middleware (helmet, cors, morgan, json parser)
    │
    ├── 2. Route Match (/api/teachers → teacherRoutes)
    │
    ├── 3. Route Middleware (optionalAuth)
    │
    ├── 4. Controller Function (searchTeachers)
    │       ├── Read req.query (subject=math)
    │       ├── Query database (Prisma)
    │       └── Send response (res.json)
    │
    └── 5. Error Handler (لو حصل خطأ)
```

**الـ Request Object (`req`):**
```js
req.params    // → { id: "123" }           — من الـ URL path
req.query     // → { subject: "math" }     — من الـ URL query string
req.body      // → { name: "Ahmed" }       — من الـ request body (POST/PUT)
req.headers   // → { authorization: "..." } — الـ headers
req.user      // → { userId, userType }    — بيتضاف من auth middleware
```

**الـ Response Object (`res`):**
```js
res.status(200).json({ success: true, data: teachers });
res.status(404).json({ success: false, message: "Not found" });
res.status(500).json({ success: false, message: "Server error" });
```

### 2.4 تنسيق الرد الموحد (Response Format)

📄 **شوف:**
- [response.js](file:///Users/sayed/Devs/Zads/zads-api/src/utils/response.js) — **مهم** — كل الردود بتمر من هنا

```js
// Success
ApiResponse.success(res, "Teachers found", teachers);
// → { success: true, message: "Teachers found", data: [...] }

// Created
ApiResponse.created(res, "Teacher registered", teacher);
// → { success: true, message: "...", data: {...} } + status 201

// Error
ApiResponse.error(res, "Not found", 404);
// → { success: false, message: "Not found" } + status 404

// Paginated
ApiResponse.paginated(res, "Teachers", teachers, { page, limit, total, totalPages });
// → { success: true, data: [...], pagination: {...} }
```

**ليه مهم؟** عشان كل ردود الـ API ليها نفس الشكل — الـ frontend يقدر يتعامل معاها بطريقة موحدة.

---

## 📦 المرحلة 3: Middleware — الوسائط

> **الهدف:** تفهم مفهوم الـ middleware — أساس Express.

### 3.1 ايه هو الـ Middleware؟

Middleware هي **دالة بتتنفذ بين الطلب والرد** — بتقدر تعدل الطلب، تعمل فحوصات، أو تمنع الطلب:

```
Request ──→ Middleware 1 ──→ Middleware 2 ──→ Controller ──→ Response
              (auth)          (validate)      (logic)
```

**شكل الـ middleware:**
```js
function myMiddleware(req, res, next) {
    // اعمل حاجة
    console.log('Request received:', req.method, req.url);

    // لو عايز يكمل → next()
    next();

    // لو عايز يوقف → res.json()
    // res.status(401).json({ message: "Unauthorized" });
}
```

**`next()` هي المفتاح:**
- `next()` → كمّل للـ middleware اللى بعده
- مش عملت `next()` ومش عملت `res.json()` → الطلب هيفضل معلق

### 3.2 أنواع الـ Middleware

#### 1. Global Middleware — بيشتغل على كل الطلبات

```js
// في app.js
app.use(helmet());      // كل طلب بيمر من هنا
app.use(cors());        // كل طلب بيمر من هنا
app.use(express.json()); // كل طلب بيمر من هنا
```

📄 **شوف كلهم في:**
- [app.js](file:///Users/sayed/Devs/Zads/zads-api/src/app.js) — السطور الأولى بعد إنشاء `app`

#### 2. Route-level Middleware — على مسارات معينة

```js
// في route file
router.get('/me', auth, isTeacher, teacherController.getMyProfile);
//                 ↑      ↑
//                 │      └── Route middleware 2 (تحقق من الدور)
//                 └── Route middleware 1 (تحقق من المصادقة)
```

📄 **شوف:**
- [teachers.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/teachers.routes.js) — لاحظ `auth`, `isTeacher`, `optionalAuth`
- [admin.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/admin.routes.js) — لاحظ `router.use(auth, isAdmin)` على كل المسارات

#### 3. Router-level Middleware — على كل مسارات router معين

```js
// كل المسارات في admin.routes.js لازم تكون admin
router.use(auth);      // أولاً: تحقق من المصادقة
router.use(isAdmin);   // ثانياً: تحقق من إنه admin
```

📄 **شوف:**
- [admin.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/admin.routes.js) — `router.use(auth, isAdmin)` في الأول
- [favorites.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/favorites.routes.js) — `router.use(auth, isParent)` في الأول

#### 4. Error-handling Middleware — التعامل مع الأخطاء

```js
// لاحظ: 4 parameters مش 3
function errorHandler(err, req, res, next) {
    // بيتنفذ لما حد يعمل next(error)
}
```

📄 **شوف:**
- [error.js](file:///Users/sayed/Devs/Zads/zads-api/src/middlewares/error.js) — **مهم جداً** — لاحظ:
  - بيتعامل مع أخطاء Prisma (P2002 → 409, P2025 → 404)
  - بيتعامل مع أخطاء Zod (validation → 400)
  - بيتعامل مع أخطاء JWT (invalid/expired → 401)
  - بيرجع stack trace في development بس

### 3.3 Middleware في المشروع — الملفات

📄 **شوف كل الـ middleware:**
- [auth.js](file:///Users/sayed/Devs/Zads/zads-api/src/middlewares/auth.js) — 5 middleware functions:
  1. `auth` — تحقق من JWT token (required)
  2. `optionalAuth` — نفس الشيء بس مش بيمنع لو مفيش token
  3. `isTeacher` — بيتحقق `req.user.userType === 'teacher'`
  4. `isParent` — بيتحقق `req.user.userType === 'parent'`
  5. `isAdmin` — بيتحقق `req.user.userType === 'admin'`
- [validate.js](file:///Users/sayed/Devs/Zads/zads-api/src/middlewares/validate.js) — factory function لـ Zod validation
- [error.js](file:///Users/sayed/Devs/Zads/zads-api/src/middlewares/error.js) — global error handler

---

## 📦 المرحلة 4: Routing & Controllers

> **الهدف:** تفهم ازاي بننظم المسارات ومنطق الأعمال.

### 4.1 الـ Router — تنظيم المسارات

Express Router بيسمحلك تجمع المسارات المتعلقة ببعض في ملف واحد:

```js
// routes/teachers.routes.js
const router = express.Router();

router.get('/search', optionalAuth, searchTeachers);      // GET /api/teachers/search
router.get('/me', auth, isTeacher, getMyProfile);          // GET /api/teachers/me
router.put('/me', auth, isTeacher, updateMyProfile);       // PUT /api/teachers/me
router.get('/:id', getTeacherById);                        // GET /api/teachers/:id

module.exports = router;
```

```js
// في app.js — ربط الـ router
app.use('/api/teachers', teacherRoutes);
// كل المسارات في teacherRoutes هتبدأ بـ /api/teachers
```

### 4.2 خريطة المسارات الكاملة

| Route File | Prefix | Auth | الوظيفة |
|-----------|--------|------|--------|
| `auth.routes.js` | `/api/auth` | مختلط | تسجيل، دخول، ملف شخصي |
| `teachers.routes.js` | `/api/teachers` | مختلط | بحث (عام) + إدارة (مدرس) |
| `parents.routes.js` | `/api/parents` | parent | ملف شخصي + أولاد |
| `subjects.routes.js` | `/api/subjects` | مختلط | قائمة (عام) + CRUD (أدمن) |
| `stages.routes.js` | `/api/stages` | مختلط | قائمة (عام) + CRUD (أدمن) |
| `favorites.routes.js` | `/api/favorites` | parent | المفضلة |
| `contactRequests.routes.js` | `/api/contact-requests` | parent/teacher | طلبات التواصل |
| `tutorRequests.routes.js` | `/api/tutor-requests` | parent/teacher | طلبات الدروس |
| `admin.routes.js` | `/api/admin` | admin | لوحة الأدمن |
| `locations.routes.js` | `/api/locations` | عام | محافظات/مدن/مناطق |
| `upload.routes.js` | `/api/upload` | مسجل | رفع صور وشهادات |
| `notifications.routes.js` | `/api/notifications` | مسجل | FCM tokens + إرسال |
| `analytics.routes.js` | `/api/analytics` | اختياري | تتبع نقرات WhatsApp |

📄 **شوف كل ملف routes — ابدأ بالأبسط:**
1. [locations.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/locations.routes.js) — **الأبسط** — كلها GET بدون auth
2. [stages.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/stages.routes.js) — بسيط — GET عام + POST/PUT للأدمن
3. [favorites.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/favorites.routes.js) — CRUD بسيط مع auth
4. [auth.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/auth.routes.js) — مسارات المصادقة
5. [teachers.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/teachers.routes.js) — **الأكبر** — بحث + إدارة

### 4.3 الـ Controllers — منطق الأعمال

الـ Controller هو المكان اللى فيه المنطق الفعلي — بيستقبل الطلب، يتعامل مع الداتابيز، ويرجع الرد:

```js
// نمط الـ controller الأساسي
const getAll = async (req, res, next) => {
    try {
        const items = await prisma.subject.findMany();
        return ApiResponse.success(res, "Subjects fetched", items);
    } catch (error) {
        next(error);  // بيروح للـ error handler
    }
};
```

📄 **شوف الـ controllers بالترتيب (من الأبسط للأعقد):**

#### الأبسط — CRUD بسيط:
1. [stages.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/stages.controller.js) — **ابدأ بده** — 3 دوال فقط (getAll, create, update)
2. [subjects.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/subjects.controller.js) — نفس النمط
3. [locations.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/locations.controller.js) — قراءة فقط مع nested relations

#### متوسط — CRUD مع علاقات:
4. [favorites.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/favorites.controller.js) — add/remove/list مع unique constraint
5. [parents.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/parents.controller.js) — إدارة أولاد مع auto-create tutor requests

#### متقدم — منطق أعمال معقد:
6. [auth.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/auth.controller.js) — **مهم جداً** — تسجيل + دخول + JWT
7. [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — **الأكبر** — بحث ذكي + ترتيب بالقرب + إدارة كاملة
8. [contactRequests.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/contactRequests.controller.js) — تدفق ثنائي الاتجاه
9. [admin.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/admin.controller.js) — إحصائيات + إدارة مستخدمين

### 4.4 نمط الـ Controller المتكرر

كل controller function بتتبع نفس النمط:

```js
const doSomething = async (req, res, next) => {
    try {
        // 1. استخراج البيانات من الطلب
        const { id } = req.params;
        const { name, email } = req.body;
        const userId = req.user.id;  // من auth middleware

        // 2. التحقق (validation) — أحياناً يدوي
        if (!name) {
            return ApiResponse.error(res, "Name is required", 400);
        }

        // 3. عملية على الداتابيز (Prisma)
        const result = await prisma.teacher.update({
            where: { id },
            data: { name, email },
        });

        // 4. إرجاع الرد
        return ApiResponse.success(res, "Updated successfully", result);
    } catch (error) {
        // 5. لو حصل خطأ → بيروح للـ error handler
        next(error);
    }
};
```

### 4.5 تتبع مسار كامل — مثال: البحث عن مدرسين

```
GET /api/teachers/search?subject=math&governorateId=1&page=1
```

**التتبع خطوة بخطوة:**

1. **الطلب يوصل Express** → `app.js`
2. **Global middleware** → `helmet`, `cors`, `morgan`, `express.json`
3. **Route matching** → `/api/teachers` → [teachers.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/teachers.routes.js)
4. **Route middleware** → `optionalAuth` (لو فيه token بيقرأه، لو مفيش عادي)
5. **Controller** → [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) → `searchTeachers()`

```js
// في searchTeachers:
// 1. قراءة الفلاتر من req.query
const { subject, stage, governorateId, cityId, areaId, page, limit } = req.query;

// 2. لو المستخدم مسجل دخول (parent) → auto-filter بموقعه ومواد أولاده
if (req.user?.userType === 'parent') {
    // بيستخدم موقع الـ parent كـ default
    // بيستخدم مواد أولاده كـ filter
}

// 3. بناء الـ query
const teachers = await prisma.teacher.findMany({
    where: { /* filters */ },
    include: { user: true, area: { include: { city: { include: { governorate: true } } } } },
    skip: (page - 1) * limit,
    take: limit,
});

// 4. ترتيب بالقرب (proximity sorting)
// نفس المنطقة > نفس المدينة > نفس المحافظة
// + موثقين أولاً + أعلى تقييم

// 5. إرجاع النتائج
return ApiResponse.paginated(res, "Teachers found", sorted, pagination);
```

---

## 📦 المرحلة 5: المصادقة والأمان (Auth & Security)

> **الهدف:** تفهم ازاي بنحمي الـ API وبنتحقق من هوية المستخدم.

### 5.1 JWT Authentication — المصادقة بالتوكن

**JWT (JSON Web Token)** هو طريقة لتخزين معلومات المستخدم في token مشفر:

```
Header.Payload.Signature
```

```json
// Payload (المحتوى)
{
    "userId": "abc-123",
    "userType": "teacher",
    "iat": 1700000000,     // issued at
    "exp": 1700604800      // expires (7 days later)
}
```

### 5.2 تدفق المصادقة الكامل

```
1. Registration (تسجيل حساب جديد)
   ┌──────────────────────────────────────────────────────┐
   │ POST /api/auth/register/teacher                      │
   │ Body: { phone, password, name }                      │
   │                                                       │
   │ Controller:                                           │
   │   1. bcrypt.hash(password, 10)  → passwordHash       │
   │   2. prisma.$transaction([                            │
   │        create User,                                   │
   │        create Teacher                                 │
   │      ])                                               │
   │   3. jwt.sign({ userId, userType }, secret, { 7d })  │
   │   4. Return { user, token }                           │
   └──────────────────────────────────────────────────────┘

2. Login (تسجيل دخول)
   ┌──────────────────────────────────────────────────────┐
   │ POST /api/auth/login                                  │
   │ Body: { phone, password }                             │
   │                                                       │
   │ Controller:                                           │
   │   1. Find user by phone (or email)                    │
   │   2. bcrypt.compare(password, user.passwordHash)      │
   │   3. Check user.status === 'active'                   │
   │   4. jwt.sign({ userId, userType }, secret, { 7d })  │
   │   5. Return { user, token }                           │
   └──────────────────────────────────────────────────────┘

3. Authenticated Request (طلب محمي)
   ┌──────────────────────────────────────────────────────┐
   │ GET /api/teachers/me                                  │
   │ Headers: Authorization: Bearer <token>                │
   │                                                       │
   │ auth middleware:                                       │
   │   1. Extract token from header                        │
   │   2. jwt.verify(token, secret)  → { userId, type }   │
   │   3. prisma.user.findUnique({ id: userId })           │
   │   4. Check status === 'active'                        │
   │   5. req.user = user  (بيضيفه للطلب)                  │
   │   6. next()  (بيكمل)                                   │
   └──────────────────────────────────────────────────────┘
```

📄 **شوف الملفات:**
- [auth.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/auth.controller.js) — register + login
- [auth.js (middleware)](file:///Users/sayed/Devs/Zads/zads-api/src/middlewares/auth.js) — auth + optionalAuth + role guards

### 5.3 Password Hashing — تشفير كلمة المرور

```js
const bcrypt = require('bcryptjs');

// عند التسجيل — تشفير
const hashedPassword = await bcrypt.hash(password, 10);
// "password123" → "$2a$10$K8F3h..." (مش ممكن يترجع)

// عند تسجيل الدخول — مقارنة
const isMatch = await bcrypt.compare(password, user.passwordHash);
// true أو false
```

> **ليه bcrypt؟** عشان حتى لو حد سرق الداتابيز، مش هيقدر يعرف كلمات المرور.

### 5.4 Role Guards — حراس الأدوار

```js
// isTeacher middleware
const isTeacher = (req, res, next) => {
    if (req.user.userType !== 'teacher') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Teachers only.'
        });
    }
    next();
};
```

**ازاي بنستخدمهم في المسارات:**
```js
// مسار خاص بالمدرسين فقط
router.get('/me', auth, isTeacher, controller.getMyProfile);
//                 ↑      ↑
//                 │      └── 2. لازم يكون teacher
//                 └── 1. لازم يكون مسجل دخول

// مسار خاص بالأدمن
router.use(auth, isAdmin);  // كل المسارات في الراوتر ده
```

### 5.5 Security Middleware — أمان إضافي وحماية الـ Backend 🛡️

📄 **شوف في app.js:**

```js
// Helmet — بيضيف security headers تلقائياً
app.use(helmet());
// X-Content-Type-Options: nosniff
// X-Frame-Options: DENY
// Strict-Transport-Security: ...

// CORS — بيحدد مين يقدر يبعت طلبات
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    // في الـ production: 'https://zads.app'
    // في التطوير: '*' (أي مصدر)
}));
```

#### 🚫 حماية المسارات و الـ Rate Limiting:
بما أن المنصة تدير عمليات حساسة مثل طلبات التواصل وتوصيل المدرسين والبحث المكثف، فإنها عرضة لهجمات القوة الغاشمة (Brute-force) على الـ Auth أو هجمات DDoS على مسارات البحث الثقيلة.

**الإجراء الأمني المطلوب:**
ينصح بشدة بدمج مكتبة **`express-rate-limit`** لحماية هذه المسارات الحساسة:

```js
const rateLimit = require('express-rate-limit');

// حماية مسارات الـ Auth (Login/Register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 10, // بحد أقصى 10 محاولات لكل IP
    message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' }
});

// حماية مسار البحث الثقيل (Search) لمنع الإرهاق العشوائي للداتابيز
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // دقيقة واحدة
    max: 30, // 30 طلب بحث بالدقيقة لكل IP
    message: { success: false, message: 'Too many search requests, please slow down.' }
});

// تركيب الـ Limiters في الـ Routes
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/search', searchLimiter, optionalAuth, searchTeachers);
```


---

## 📦 المرحلة 6: التحقق من البيانات (Validation)

> **الهدف:** تفهم ازاي بنتأكد إن البيانات صحيحة قبل ما نعالجها.

### 6.1 ايه هو Zod؟

Zod هو **schema validation library** — بتعرف شكل البيانات المتوقعة وهو بيتحقق:

```js
const z = require('zod');

const userSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    age: z.number().min(18).optional(),
});

// التحقق
const result = userSchema.safeParse({ name: "A", email: "bad" });
// result.success → false
// result.error → { name: "too short", email: "invalid email" }
```

📄 **شوف:**
- [validators.js](file:///Users/sayed/Devs/Zads/zads-api/src/utils/validators.js) — كل الـ schemas

**الـ schemas المعرفة:**
```js
// تسجيل مدرس
registerTeacherSchema = z.object({
    phone: z.string().regex(/^(\+20|0)?1[0125][0-9]{8}$/),  // رقم مصري
    password: z.string().min(6),
    name: z.string().min(2),
    email: z.string().email().optional(),
    bio: z.string().optional(),
    experienceYears: z.number().optional(),
    // ...
});

// تسجيل دخول
loginSchema = z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(1),
}).refine(data => data.phone || data.email, {
    message: "Phone or email is required"
});
```

### 6.2 Validation Middleware Factory

📄 **شوف:**
- [validate.js](file:///Users/sayed/Devs/Zads/zads-api/src/middlewares/validate.js) — **مهم** — factory function

```js
// validate هي دالة بتاخد schema وبترجع middleware
const validate = (schema, target = 'body') => {
    return (req, res, next) => {
        const result = schema.safeParse(req[target]);
        if (!result.success) {
            // بيحول الأخطاء لشكل مفهوم
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: result.error.errors
            });
        }
        // بيستبدل الـ body بالبيانات المتحقق منها
        req[target] = result.data;
        next();
    };
};
```

**الاستخدام في المسارات:**
```js
router.post('/register/teacher', validate(registerTeacherSchema), register);
router.post('/login', validate(loginSchema), login);
```

---

## 📦 المرحلة 7: أنماط متقدمة

> **الهدف:** تفهم الأنماط المتقدمة المستخدمة في المشروع.

### 7.1 Prisma في الـ Controllers — أنماط التعامل مع الداتابيز

**1. البحث مع فلاتر ديناميكية:**
```js
const where = {};
if (subject) where.subjects = { some: { subjectId: subject } };
if (areaId) where.areaId = areaId;
// بيبني الـ query حسب الفلاتر المتاحة
```

**2. Transactions — عمليات متعددة ذرية:**
```js
const [user, teacher] = await prisma.$transaction([
    prisma.user.create({ data: userData }),
    prisma.teacher.create({ data: teacherData }),
]);
// لو أي عملية فشلت → الكل بيترجع
```

**3. Nested includes — علاقات متداخلة:**
```js
const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
        user: true,
        area: {
            include: {
                city: {
                    include: { governorate: true }
                }
            }
        },
        subjects: {
            include: { subject: true, stage: true }
        }
    }
});
```

**4. Partial updates — تحديث جزئي:**
```js
const data = {};
if (name !== undefined) data.name = name;
if (bio !== undefined) data.bio = bio;
// بيحدث بس الحقول اللى اتبعتت
await prisma.teacher.update({ where: { id }, data });
```

📄 **شوف أمثلة حقيقية:**
- [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — كل الأنماط فوق
- [parents.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/parents.controller.js) — transactions + auto-create

### 7.2 Pagination — صفحات النتائج

```js
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

const [items, total] = await Promise.all([
    prisma.teacher.findMany({ where, skip, take: limit }),
    prisma.teacher.count({ where }),
]);

const totalPages = Math.ceil(total / limit);

return ApiResponse.paginated(res, "Success", items, {
    page, limit, total, totalPages
});
```

📄 **شوف:**
- [admin.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/admin.controller.js) — pagination في كل الـ listing endpoints

### 7.3 Proximity Sorting — الترتيب بالقرب

**ميزة فريدة في المشروع** — المدرسين بيترتبوا حسب قربهم من المستخدم:

```js
// نظام النقاط:
// نفس المنطقة → 3 نقاط (الأقرب)
// نفس المدينة → 2 نقاط
// نفس المحافظة → 1 نقطة
// + موثقين أولاً
// + أعلى تقييم
```

📄 **شوف:**
- [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — ابحث عن `proximity` أو `sort`

### 7.4 File Uploads — رفع الملفات

📄 **شوف:**
- [upload.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/upload.controller.js) — Multer setup
- [upload.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/upload.routes.js) — المسارات

```js
// Multer setup
const upload = multer({
    storage: diskStorage({ destination: 'public/uploads/', filename: unique }),
    limits: { fileSize: 5 * 1024 * 1024 },  // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images allowed'));
    }
});

// الاستخدام
router.post('/image', auth, upload.single('image'), uploadImage);
```

### 7.5 Firebase Notifications — الإشعارات

📄 **شوف:**
- [firebase.js](file:///Users/sayed/Devs/Zads/zads-api/src/config/firebase.js) — إعداد Firebase Admin
- [notification.service.js](file:///Users/sayed/Devs/Zads/zads-api/src/services/notification.service.js) — Service class
- [notifications.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/notifications.controller.js) — الـ endpoints

### 7.6 Vercel Deployment — نشر على Vercel

📄 **شوف:**
- [vercel.json](file:///Users/sayed/Devs/Zads/zads-api/vercel.json) — إعدادات النشر

```json
{
    "version": 2,
    "builds": [
        { "src": "src/app.js", "use": "@vercel/node" }
    ],
    "routes": [
        { "src": "/(.*)", "dest": "src/app.js" }
    ]
}
```

**الفكرة:** Express بيتحول لـ serverless function على Vercel — كل request بيشغل الـ app.js.

---

### 7.7 المراقبة والـ Logging في الإنتاج (Production Monitoring & Logging) 🪵

> [!IMPORTANT]
> **morgan** ممتاز لتسجيل طلبات الـ HTTP في الـ Console أثناء التطوير، ولكنه غير كافٍ في بيئة الإنتاج الحقيقية!
> في الإنتاج، نحتاج لتتبع أخطاء التطبيق الداخلية (Application-level errors)، مثل فشل إرسال إشعارات Firebase، أو فشل الرفع لـ S3، مع معرفة تفاصيل الخطأ ووقت حدوثه.

#### 💡 استخدام Logger احترافي (Winston or Pino):
يفضل إعداد مكتبة مثل `winston` لتصدير السجلات إلى ملفات أو خدمات مراقبة سحابية (مثل Datadog أو Logtail):

```js
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

// في بيئة التطوير، نعرض في الـ Console بشكل مقروء
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}
```

#### ☁️ تتبع الأخطاء في بيئة الـ Serverless (Vercel):
عند تشغيل الـ API كـ Serverless Functions على Vercel:
1. **لا يمكن الكتابة على القرص الصلب المحلي** (File-based logging لن يعمل لأن السيرفر مؤقت/ephemeral).
2. **الحل البديل:** توجيه كل الأخطاء لـ `Console.error` لأن Vercel يلتقط الـ standard outputs تلقائياً ويعرضها في **Vercel Logs dashboard**.
3. **تكامل خارجي:** يفضل ربط Vercel بـ Log Drains مثل **Axiom** أو **BetterStack** للحفاظ على الـ Logs بشكل دائم والبحث فيها بسهولة.

---

## ✅ تمارين عملية


### تمرين 1: تتبع طلب كامل
1. افتح [auth.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/auth.routes.js) — شوف مسار `/login`
2. شوف ايه الـ middleware عليه (validate)
3. روح لـ [validators.js](file:///Users/sayed/Devs/Zads/zads-api/src/utils/validators.js) — شوف `loginSchema`
4. روح لـ [auth.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/auth.controller.js) — شوف `login` function
5. شوف ازاي بيتحقق من كلمة المرور وبيولد JWT

### تمرين 2: أضف endpoint جديد
1. أضف `GET /api/teachers/count` يرجع عدد المدرسين
2. أضف الـ route في [teachers.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/teachers.routes.js)
3. أضف الـ controller في [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js)
4. جرب بـ Postman أو curl

### تمرين 3: أضف validation جديد
1. أضف schema في [validators.js](file:///Users/sayed/Devs/Zads/zads-api/src/utils/validators.js) لتحديث ملف المدرس
2. استخدمه مع `validate()` middleware في route

### تمرين 4: أضف middleware جديد
1. أنشئ middleware يسجل وقت كل request
2. ضيفه في [app.js](file:///Users/sayed/Devs/Zads/zads-api/src/app.js) كـ global middleware

---

## ⏭️ الخطوة التالية

لما تخلص المرحلة دي، روح لـ:
📘 [03-postgresql-prisma.md](file:///Users/sayed/Devs/Zads/learn/03-postgresql-prisma.md) — خريطة تعلم PostgreSQL و Prisma

</div>

