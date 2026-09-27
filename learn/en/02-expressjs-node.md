# 📙 Express.js & Node.js Learning Roadmap — from the Zads Project


> **Level:** From scratch to a complete understanding of the API's code
> **On the fullstack path:** days 6–12 only (14 hours). Do not add 3–4 weeks on top of the rest of the path. The calendar is [00-fullstack-path.md](./00-fullstack-path.md).
> **Video for these days:** [event loop](https://www.youtube.com/watch?v=8aGhZQkoFbQ) on day 6, then the [Net Ninja Node crash course](https://www.youtube.com/playlist?list=PL4cUxeGkcC9jsz4LDYc6kv3ymONOKxwBU) without the view-engine and MongoDB lessons.
> **Method:** Each topic contains an explanation + link to a real file in the project

<blockquote dir="rtl">

*الباك إند هنا معمول بميكس لذيذ بين إكسبريس ونود، متقسم صح ومرتب بطريقة تخلي إضافة أي راوت أو فيتشر جديدة تاخد دقايق.*

</blockquote>

---

## 🗺️ The Complete Roadmap

```
Phase 1: Node.js Basics ← (Week 1)
    │
    ▼
Phase 2: Express.js — The Framework ← (Week 1-2)
    │
    ▼
Phase 3: Middleware — The Interceptors ← (Week 2)
    │
    ▼
Phase 4: Routing & Controllers ← (Week 2-3)
    │
    ▼
Phase 5: Authentication & Security ← (Week 3)
    │
    ▼
Phase 6: Data Validation ← (Week 3-4)
    │
    ▼
Phase 7: Advanced Patterns ← (Week 4)
```

<blockquote dir="rtl">

*امشي مع الخطوات دي واحدة واحدة، ونود جيه إس وإكسبريس هيبقوا في جيبك الصغير.*

</blockquote>

---

## 📦 Phase 1: Node.js Basics

> **Goal:** Understand Node.js and how it runs before you start Express.
<blockquote dir="rtl">

*نود جي إس هي البيئة اللي بتشغل كود الجافا سكريبت بتاعنا على السيرفر، بدل ما كنا بنشغله في المتصفح بس.*

</blockquote>

### 1.1 What is Node.js?

Node.js is a **runtime** that allows you to run JavaScript on the server:

| Browser | Node.js (Server) |
|---------|------------------|
| `document`, `window` | `process`, `fs`, `path` |
| Renders user interfaces | Interacts with files, databases, and networks |
| Listens to user browser events | Listens to incoming HTTP requests |

<blockquote dir="rtl">

*في المتصفح كان عندك DOM و window، هنا في نود عندك الـ filesystem وقدرة إنك تتصل بالداتابيز علطول.*

</blockquote>

### 1.2 Modules — Organizing Code

In Node.js, every file is an independent **module**:

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

📄 **Check in the project:**
- [env.js](file:///Users/sayed/Devs/Zads/zads-api/src/config/env.js) — Exports environment variables.
- [database.js](file:///Users/sayed/Devs/Zads/zads-api/src/config/database.js) — Exports the Prisma client instance.

<blockquote dir="rtl">

*الـ CommonJS (المعروف بـ require) والـ ES Modules (المعروف بـ import) هما الطريقتين اللي بنربط بيهم الملفات ببعض.*

</blockquote>

### 1.3 `package.json` — The Project Manifest

📄 **Check:**
- [package.json](file:///Users/sayed/Devs/Zads/zads-api/package.json) — Notice:

| Section | Purpose |
|---------|---------|
| `scripts` | Execution commands: `dev`, `start`, `db:migrate` |
| `dependencies` | Libraries required for production |
| `devDependencies` | Libraries required for development only (nodemon) |

**Important Commands:**
```bash
pnpm run dev          # تشغيل السيرفر مع nodemon (auto-restart)
pnpm run start        # تشغيل السيرفر في الإنتاج
pnpm run db:migrate   # تشغيل migrations
pnpm run db:generate  # توليد Prisma client
pnpm run db:seed      # تعبئة الداتابيز ببيانات أولية
```

<blockquote dir="rtl">

*ملف package.json ده هو البطاقة الشخصية بتاعة المشروع، فيه كل الأوامر والمكتبات اللي بنحتاجها عشان نشغله.*

</blockquote>

### 1.4 Environment Variables

```js
// بنستخدم dotenv عشان نقرأ من ملف .env
require('dotenv').config();
 
// بعدين بنستخدم process.env
const port = process.env.PORT || 3000;
const secret = process.env.JWT_SECRET;
```

📄 **Check:**
- [env.js](file:///Users/sayed/Devs/Zads/zads-api/src/config/env.js) — Gathers all variables in one place.
- [.env.example](file:///Users/sayed/Devs/Zads/zads-api/.env.example) — Template for required environment variables.

<blockquote dir="rtl">

*الـ env variables بنستخدمها عشان نحفظ الحاجات السرية زي كلمات المرور وروابط الداتابيز بعيد عن كود الـ جيت هاب.*

</blockquote>

---

## 📦 Phase 2: Express.js — The Framework

> **Goal:** Understand how Express works and the request/response cycle.
<blockquote dir="rtl">

*إكسبريس هو الإطار اللي بيخلينا نعمل سيرفر ويب بيستقبل طلبات من الفرونت إند ويرد عليها ببيانات JSON.*

</blockquote>

### 2.1 What is Express.js?

Express is a **web framework** for Node.js — the easiest way to build an API server:

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

### 2.2 Entry Point — `app.js`

📄 **Check:**
- [app.js](file:///Users/sayed/Devs/Zads/zads-api/src/app.js) — **The most important file — Start here!**

**The order of setup inside `app.js` is critical:**

```
1. Imports (Libraries and files)
    ↓
2. Express app creation
    ↓
3. Global middleware
    │ ├── helmet()          ← Security
    │ ├── cors()            ← Enable requests from other websites
    │ ├── morgan()          ← Log incoming requests
    │ ├── express.json()    ← Parse JSON body
    │ └── express.static()  ← Serve static files (uploads)
    ↓
4. Route mounting
    │ ├── /api/auth         → authRoutes
    │ ├── /api/teachers     → teacherRoutes
    │ ├── /api/parents      → parentRoutes
    │ └── ... (13 route files)
    ↓
5. Health check endpoint
    ↓
6. Error handler (Must be at the very end)
    ↓
7. Server start
```

**Notice in the code:**
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

<blockquote dir="rtl">

*الترتيب في ملف app.js حساس جداً، الميدل ويرز العامة لازم تتحط قبل الراوتس، والـ Error Handler لازم يكون آخر واحد خالص.*

</blockquote>

### 2.3 Request & Response

Every HTTP request goes through these phases:

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
    └── 5. Error Handler (If an error occurs)
```

**The Request Object (`req`):**
```js
req.params    // → { id: "123" }           — من الـ URL path
req.query     // → { subject: "math" }     — من الـ URL query string
req.body      // → { name: "Ahmed" }       — من الـ request body (POST/PUT)
req.headers   // → { authorization: "..." } — الـ headers
req.user      // → { userId, userType }    — بيتضاف من auth middleware
```

**The Response Object (`res`):**
```js
res.status(200).json({ success: true, data: teachers });
res.status(404).json({ success: false, message: "Not found" });
res.status(500).json({ success: false, message: "Server error" });
```

<blockquote dir="rtl">

*الـ req هو كل اللي جاي من العميل (البيانات والـ URL)، والـ res هو ردنا عليه سواء بنجاح أو بخطأ.*

</blockquote>

### 2.4 Unified Response Format

📄 **Check:**
- [response.js](file:///Users/sayed/Devs/Zads/zads-api/src/utils/response.js) — **Important** — All API responses pass through here.

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

**Why is this important?** It ensures every API response has the exact same structure, making it much easier for the frontend to handle success, pagination, and errors consistently.

<blockquote dir="rtl">

*توحيد شكل الردود (API Responses) بيريح الفرونت إند جداً، ومبيخليهوش يكتب شروط مختلفة لكل راوت.*

</blockquote>

---

## 📦 Phase 3: Middleware — The Interceptors

> **Goal:** Understand the concept of middleware — the heart of Express.
<blockquote dir="rtl">

*الميدل وير هو زي نقطة التفتيش في الطريق، بيفحص الطلب وممكن يعدله أو يرفضه خالص قبل ما يوصل للكنترولر.*

</blockquote>

### 3.1 What is Middleware?

Middleware is a **function executed between the request and the response** — it can modify the request, execute validation checks, or block the request entirely:

```
Request ──→ Middleware 1 ──→ Middleware 2 ──→ Controller ──→ Response
              (auth)          (validate)      (logic)
```

**Structure of a middleware:**
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

**`next()` is the key:**
- `next()` → Proceed to the next middleware or controller.
- If you don't call `next()` and don't send a response → The request will hang forever.

<blockquote dir="rtl">

*أهم كلمة هنا هي `next()`، لو نسيتها الطلب هيفضل معلق واليوزر هيفضل شايف صفحة بتحمل علطول.*

</blockquote>

### 3.2 Types of Middleware

#### 1. Global Middleware — Runs on every request
```js
// في app.js
app.use(helmet());      // كل طلب بيمر من هنا
app.use(cors());        // كل طلب بيمر من هنا
app.use(express.json()); // كل طلب بيمر من هنا
```

📄 **Check them in:**
- [app.js](file:///Users/sayed/Devs/Zads/zads-api/src/app.js) — First few lines after creating the `app` instance.

#### 2. Route-level Middleware — Applied to specific routes
```js
// في route file
router.get('/me', auth, isTeacher, teacherController.getMyProfile);
//                 ↑      ↑
//                 │      └── Route middleware 2 (تحقق من الدور)
//                 └── Route middleware 1 (تحقق من المصادقة)
```

📄 **Check:**
- [teachers.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/teachers.routes.js) — Notice `auth`, `isTeacher`, and `optionalAuth`.
- [admin.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/admin.routes.js) — Notice `router.use(auth, isAdmin)` protecting all admin endpoints.

#### 3. Router-level Middleware — Applied to all routes in a specific router
```js
// كل المسارات في admin.routes.js لازم تكون admin
router.use(auth);      // أولاً: تحقق من المصادقة
router.use(isAdmin);   // ثانياً: تحقق من إنه admin
```

📄 **Check:**
- [admin.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/admin.routes.js) — `router.use(auth, isAdmin)` at the top.
- [favorites.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/favorites.routes.js) — `router.use(auth, isParent)` at the top.

#### 4. Error-handling Middleware — Handles errors
```js
// لاحظ: 4 parameters مش 3
function errorHandler(err, req, res, next) {
    // بيتنفذ لما حد يعمل next(error)
}
```

📄 **Check:**
- [error.js](file:///Users/sayed/Devs/Zads/zads-api/src/middlewares/error.js) — **Very Important** — Handles:
  - Prisma database errors (P2002 → 409 Conflict, P2025 → 404 Not Found).
  - Zod validation errors (400 Bad Request).
  - JWT authentication errors (expired/invalid → 401 Unauthorized).
  - Returns stack trace in development only.

<blockquote dir="rtl">

*الـ Error Handler هو شبكة الأمان بتاعة السيرفر، لو كود الكنترولر ضرب لأي سبب هو بيلقطه ويرجع رد نضيف للمستخدم.*

</blockquote>

### 3.3 Middleware in the Project — Files

📄 **Check all middlewares:**
- [auth.js (middleware)](file:///Users/sayed/Devs/Zads/zads-api/src/middlewares/auth.js) — 5 middleware functions:
  1. `auth` — Required JWT check.
  2. `optionalAuth` — Authenticates user if token exists, but doesn't block if missing.
  3. `isTeacher` — Checks if `req.user.userType === 'teacher'`.
  4. `isParent` — Checks if `req.user.userType === 'parent'`.
  5. `isAdmin` — Checks if `req.user.userType === 'admin'`.
- [validate.js](file:///Users/sayed/Devs/Zads/zads-api/src/middlewares/validate.js) — Factory function for Zod validation schemas.
- [error.js](file:///Users/sayed/Devs/Zads/zads-api/src/middlewares/error.js) — Global error handler.

---

## 📦 Phase 4: Routing & Controllers

> **Goal:** Understand how we organize endpoints and business logic.
<blockquote dir="rtl">

*الـ Routes بتحدد الـ URLs، والـ Controllers فيها اللوجيك والـ Queries اللي بتجيب البيانات من الداتابيز.*

</blockquote>

### 4.1 The Router — Organizing Endpoints

Express Router lets you group related endpoints in a single file:

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

### 4.2 Complete Route Map

| Route File | Prefix | Auth | Function / Responsibility |
|-----------|--------|------|---------------------------|
| `auth.routes.js` | `/api/auth` | Mixed | Registration, login, profile management |
| `teachers.routes.js` | `/api/teachers` | Mixed | Tutor search (public) + Tutor settings (auth) |
| `parents.routes.js` | `/api/parents` | parent | Parent profile + children management |
| `subjects.routes.js` | `/api/subjects` | Mixed | Subjects list (public) + CRUD (admin) |
| `stages.routes.js` | `/api/stages` | Mixed | Educational stages (public) + CRUD (admin) |
| `favorites.routes.js` | `/api/favorites` | parent | Favorites list CRUD |
| `contactRequests.routes.js` | `/api/contact-requests` | parent/teacher | Two-way contact requests |
| `tutorRequests.routes.js` | `/api/tutor-requests` | parent/teacher | Public tutoring requests |
| `admin.routes.js` | `/api/admin` | admin | Admin dashboard functions |
| `locations.routes.js` | `/api/locations` | Public | Egyptian locations (Govs/Cities/Areas) |
| `upload.routes.js` | `/api/upload` | Auth | Image and certificate uploads |
| `notifications.routes.js` | `/api/notifications` | Auth | FCM push notifications tokens |
| `analytics.routes.js` | `/api/analytics` | Optional / mixed | Funnel events, attribution, contact clicks, WhatsApp clicks |

📄 **Check route files — start with the simplest:**
1. [locations.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/locations.routes.js) — **Simplest** — All GET requests with no auth.
2. [stages.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/stages.routes.js) — Simple — Public GET + Admin-only POST/PUT.
3. [favorites.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/favorites.routes.js) — Basic CRUD with parent auth.
4. [auth.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/auth.routes.js) — Authentication endpoints.
5. [teachers.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/teachers.routes.js) — **Largest** — Search + Management.

<blockquote dir="rtl">

*الجدول ده بيختصرلك خريطة الباك إند بالكامل، هتعرف في ثواني أي راوت مكانه فين وبيحتاج صلاحية إيه.*

</blockquote>

### 4.3 Controllers — Business Logic

The Controller is where the actual logic lives — it processes requests, interacts with the database via Prisma, and returns responses:

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

📄 **Check controllers in order (simplest to most complex):**

#### Simplest — Basic CRUD:
1. [stages.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/stages.controller.js) — **Start here** — Just 3 functions (getAll, create, update).
2. [subjects.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/subjects.controller.js) — Same pattern.
3. [locations.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/locations.controller.js) — Read-only nested location relationships.

#### Medium — CRUD with Relations:
4. [favorites.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/favorites.controller.js) — Add/Remove/List with unique constraint checks.
5. [parents.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/parents.controller.js) — Children management with automatic tutor requests creation.

#### Advanced — Complex Business Logic:
6. [auth.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/auth.controller.js) — **Very Important** — Register + Login + JWT tokens issuance.
7. [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — **Largest** — Smart search + proximity sorting + profile management.
8. [contactRequests.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/contactRequests.controller.js) — Two-way contact flows between parents and tutors.
9. [admin.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/admin.controller.js) — Statistics + full user management lists.

### 4.4 Standard Controller Pattern

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

<blockquote dir="rtl">

*النمط ده متكرر في كل الفانكشنز: جرب نفذ، لو لقيت مشكلة ابعت الخطأ للـ next(error) وهي هتروح للـ Error Middleware علطول.*

</blockquote>

### 4.5 Tracing a Full Request Flow — Example: Search Tutors

```
GET /api/teachers/search?subject=math&governorateId=1&page=1
```

**Tracing steps:**

1. **Request arrives at Express** → `app.js`.
2. **Global middleware** → `helmet`, `cors`, `morgan`, `express.json`.
3. **Route matching** → `/api/teachers` → [teachers.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/teachers.routes.js).
4. **Route middleware** → `optionalAuth` (reads user session if token exists, otherwise continues).
5. **Controller** → [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) → `searchTeachers()`.

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

<blockquote dir="rtl">

*البحث هنا ذكي جداً وبيترتب حسب قرب المدرس من الطالب عشان يحقق فكرة "الجيرة التعليمية" اللي قايم عليها الموقع.*

</blockquote>

---

## 📦 Phase 5: Authentication & Security

> **Goal:** Understand how we secure the API and verify user identity.
<blockquote dir="rtl">

*أمن السيرفر هو خط الدفاع الأول، بنشفر الباسوردات بالـ bcrypt وبنحمي الراوتس بالـ JWT.*

</blockquote>

### 5.1 JWT Authentication

**JWT (JSON Web Token)** is a method to store user details in an encrypted token format:

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

### 5.2 Complete Auth Flow

```
1. Registration (تسجيل حساب جديد)
    ┌──────────────────────────────────────────────────────┐
    │ POST /api/auth/register/teacher                      │
    │ Body: { phone, password, name }                      │
    │                                                      │
    │ Controller:                                          │
    │   1. bcrypt.hash(password, 10)  → passwordHash       │
    │   2. prisma.$transaction([                            │
    │        create User,                                  │
    │        create Teacher                                │
    │      ])                                              │
    │   3. jwt.sign({ userId, userType }, secret, { 7d })  │
    │   4. Return { user, token }                          │
    └──────────────────────────────────────────────────────┘

2. Login (تسجيل دخول)
    ┌──────────────────────────────────────────────────────┐
    │ POST /api/auth/login                                 │
    │ Body: { phone, password }                            │
    │                                                      │
    │ Controller:                                          │
    │   1. Find user by phone (or email)                   │
    │   2. bcrypt.compare(password, user.passwordHash)     │
    │   3. Check user.status === 'active'                  │
    │   4. jwt.sign({ userId, userType }, secret, { 7d })  │
    │   5. Return { user, token }                          │
    └──────────────────────────────────────────────────────┘

3. Authenticated Request (طلب محمي)
    ┌──────────────────────────────────────────────────────┐
    │ GET /api/teachers/me                                 │
    │ Headers: Authorization: Bearer <token>               │
    │                                                      │
    │ auth middleware:                                     │
    │   1. Extract token from header                       │
    │   2. jwt.verify(token, secret)  → { userId, type }   │
    │   3. prisma.user.findUnique({ id: userId })          │
    │   4. Check status === 'active'                       │
    │   5. req.user = user  (بيضيفه للطلب)                 │
    │   6. next()  (بيكمل)                                 │
    └──────────────────────────────────────────────────────┘
```

📄 **Check files:**
- [auth.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/auth.controller.js) — register + login functions.
- [auth.js (middleware)](file:///Users/sayed/Devs/Zads/zads-api/src/middlewares/auth.js) — JWT validation and role guards.

### 5.3 Password Hashing

```js
const bcrypt = require('bcryptjs');
 
// عند التسجيل — تشفير
const hashedPassword = await bcrypt.hash(password, 10);
// "password123" → "$2a$10$K8F3h..." (مش ممكن يترجع)
 
// عند تسجيل الدخول — مقارنة
const isMatch = await bcrypt.compare(password, user.passwordHash);
// true أو false
```

> **Why bcrypt?** Even if the database is breached, the raw passwords cannot be extracted from hashes.

### 5.4 Role Guards

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

**How we use them on routes:**
```js
// مسار خاص بالمدرسين فقط
router.get('/me', auth, isTeacher, controller.getMyProfile);
//                 ↑      ↑
//                 │      └── 2. لازم يكون teacher
//                 └── 1. لازم يكون مسجل دخول
 
// مسار خاص بالأدمن
router.use(auth, isAdmin);  // كل المسارات في الراوتر ده
```

<blockquote dir="rtl">

*الـ Role Guards بتضمن إن المدرس مايقدرش يلعب في بيانات ولي الأمر، وإن الأدمن بس هو اللي يقدر يشوف الإحصائيات الحساسة.*

</blockquote>

### 5.5 Security Middleware — Extra Protection 🛡

📄 **Check `app.js`:**

```js
// Helmet — بيضيف security headers تلقائياً
app.use(helmet());
 
// CORS — بيحدد مين يقدر يبعت طلبات
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
}));
```

#### 🚫 Route Protection & Rate Limiting:

Since the platform handles sensitive operations like contact requests and heavy search queries, it is susceptible to brute-force auth attacks or DDoS search exhaustion.

**Recommended Security Action:**
It is highly recommended to integrate **`express-rate-limit`** to secure sensitive endpoints:

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

<blockquote dir="rtl">

*الـ Rate Limiting ده بيمنع أي حد خبيث إنه يغرق السيرفر بطلبات تسجيل دخول عشوائية ويهنج السيستم.*

</blockquote>

---

## 📦 Phase 6: Data Validation

> **Goal:** Understand how we validate incoming data before processing it.
<blockquote dir="rtl">

*الـ Zod بيقف بالمرصاد لأي داتا داخلة مش مظبوطة، عشان نضمن إن الداتابيز دايماً نضيفة ومفيهاش هري.*

</blockquote>

### 6.1 What is Zod?

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
```

📄 **Check:**
- [validators.js](file:///Users/sayed/Devs/Zads/zads-api/src/utils/validators.js) — All schemas definitions.

```js
// تسجيل مدرس
registerTeacherSchema = z.object({
    phone: z.string().regex(/^(\+20|0)?1[0125][0-9]{8}$/),  // رقم مصري
    password: z.string().min(6),
    name: z.string().min(2),
    email: z.string().email().optional(),
    bio: z.string().optional(),
    experienceYears: z.number().optional(),
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

📄 **Check:**
- [validate.js](file:///Users/sayed/Devs/Zads/zads-api/src/middlewares/validate.js) — Validation factory middleware.

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

**Usage inside routes:**
```js
router.post('/register/teacher', validate(registerTeacherSchema), register);
router.post('/login', validate(loginSchema), login);
```

<blockquote dir="rtl">

*الـ Factory function دي عبقرية، بنبعتلها الـ schema وهي بترجعلنا ميدل وير جاهز يفحص الراوت فوراً.*

</blockquote>

---

## 📦 Phase 7: Advanced Patterns

> **Goal:** Understand advanced patterns utilized in the project.
<blockquote dir="rtl">

*دي الحركات الاحترافية اللي بتخلي كود الباك إند سريع وقابل للنمو من غير ما يتحول لعش عنكبوت.*

</blockquote>

### 7.1 Prisma in Controllers — Database Query Patterns

**1. Dynamic Query Filtering:**
```js
const where = {};
if (subject) where.subjects = { some: { subjectId: subject } };
if (areaId) where.areaId = areaId;
```

**2. Transactions — Atomic Operations:**
```js
const [user, teacher] = await prisma.$transaction([
    prisma.user.create({ data: userData }),
    prisma.teacher.create({ data: teacherData }),
]);
```

**3. Nested Includes:**
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

**4. Partial Updates:**
```js
const data = {};
if (name !== undefined) data.name = name;
if (bio !== undefined) data.bio = bio;
await prisma.teacher.update({ where: { id }, data });
```

📄 **Check real examples:**
- [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — Contains all patterns listed above.
- [parents.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/parents.controller.js) — Transactions and auto-creation logic.

### 7.2 Pagination

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

📄 **Check:**
- [admin.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/admin.controller.js) — Uses pagination in all listing endpoints.

<blockquote dir="rtl">

*دايماً نستخدم Promise.all لما نكون بنعمل كذا كويري مش معتمدين على بعض، عشان يشتغلوا مع بعض في نفس الوقت.*

</blockquote>

### 7.3 Proximity Sorting

**Unique project feature** — Tutors are sorted based on their geographical proximity to the user:
- Same Area → 3 points (Closest).
- Same City → 2 points.
- Same Governorate → 1 point.
- + Verified status first.
- + Highest ratings first.

📄 **Check:**
- [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js) — Search for `proximity` or `sort` logic.

### 7.4 File Uploads

📄 **Check:**
- [upload.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/upload.controller.js) — Multer setup.
- [upload.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/upload.routes.js) — Router endpoints.

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

<blockquote dir="rtl">

*ملتر بيشيل عننا هم قراية الملفات، بيفحص حجم الصورة والـ extension بتاعها ويرفعها على الفولدر المناسب.*

</blockquote>

### 7.5 Firebase Notifications

📄 **Check:**
- [firebase.js](file:///Users/sayed/Devs/Zads/zads-api/src/config/firebase.js) — Firebase Admin initialization.
- [notification.service.js](file:///Users/sayed/Devs/Zads/zads-api/src/services/notification.service.js) — FCM notification helper.
- [notifications.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/notifications.controller.js) — Controller endpoints.

### 7.6 Vercel Deployment — Serverless API

📄 **Check:**
- [vercel.json](file:///Users/sayed/Devs/Zads/zads-api/vercel.json) — Vercel serverless configurations.

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

**Concept:** The Express API runs as a Serverless Function on Vercel — each incoming request instantiates `app.js` dynamically.

<blockquote dir="rtl">

*الفيرسيل بيحول إكسبريس لسيرفر ليس فانكشنز، يعني السيرفر بيقوم ويرد ويقفل لوحده وده بيوفر فلوس الاستضافة جداً.*

</blockquote>

### 7.7 Production Monitoring & Logging 🪵

> [!IMPORTANT]
> **morgan** is excellent for development HTTP request logging, but is insufficient for production!
> In production, we need to log application-level warnings or errors (e.g., Firebase notification delivery failures, S3 upload errors) along with precise timestamps.

#### 💡 Professional Logger (Winston or Pino):

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

#### ☁️ Serverless Logging (Vercel):

When deployed on Vercel:
1. **Local disk logging will NOT work** (disks are ephemeral).
2. **Alternative:** Forward logs directly to `console.error` because Vercel automatically captures standard output and renders it in the **Vercel Logs dashboard**.
3. **Integration:** Hook Vercel logs to permanent drains like **Axiom** or **BetterStack** for indexing and long-term search.

<blockquote dir="rtl">

*في السيرفر ليس ما ينفعش تكتب لوجز في فايل على القرص الصلب، لأن السيرفر بيتمسح علطول. البديل إنك تبعت للكونسول وفيرسيل بيلقطه.*

</blockquote>

---

## ✅ Practical Exercises

### Exercise 1: Trace a Full Endpoint
1. Open [auth.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/auth.routes.js) — see the `/login` route.
2. Check the validation middleware.
3. Open [validators.js](file:///Users/sayed/Devs/Zads/zads-api/src/utils/validators.js) — see `loginSchema`.
4. Open [auth.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/auth.controller.js) — check the `login` function.
5. See how passwords are compared and JWT is generated.

### Exercise 2: Add a New Endpoint
1. Add `GET /api/teachers/count` returning the total count of registered tutors.
2. Register the route in [teachers.routes.js](file:///Users/sayed/Devs/Zads/zads-api/src/routes/teachers.routes.js).
3. Implement the controller function in [teachers.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/teachers.controller.js).
4. Test using Postman or curl.

### Exercise 3: Add Validation
1. Create a validation schema in [validators.js](file:///Users/sayed/Devs/Zads/zads-api/src/utils/validators.js) for tutor profile updates.
2. Hook it as a `validate()` middleware on the PUT endpoint.

### Exercise 4: Create a Custom Middleware
1. Write a middleware that logs the processing time for each request.
2. Register it globally in [app.js](file:///Users/sayed/Devs/Zads/zads-api/src/app.js).

<blockquote dir="rtl">

*التمارين دي هتحببك في الباك إند، جرب تخلصهم وهتلاقي إيدك بقت خفيفة في الكود.*

</blockquote>

---

## ⏭️ Next Step

Once you complete this phase, head over to:
📘 [03-postgresql-prisma.md](./03-postgresql-prisma.md) — PostgreSQL and Prisma Learning Roadmap.
