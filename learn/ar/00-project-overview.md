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

# 🏗️ نظرة عامة على مشروع Zads — تخطيط المشروع وقرارات التصميم

> لو هدفك تكمّل من frontend senior لـ fullstack ‏(TypeScript و Node.js و SQL)، ابدأ من [00-fullstack-path.md](./00-fullstack-path.md). الملف ده مرجع للمشروع، مش أول يوم دراسة.



> **الهدف من هذا الملف:** تفهم المشروع ككل — ليه اخترنا التقنيات دي، ازاي رتبنا الملفات، وايه الفلسفة ورا كل قرار.

---

## 📌 ايه هو Zads؟

**Zads (زاد)** هو منصة تعليمية محلية بتربط المتعلمين (طلاب، أولياء أمور، محترفين) بالمدرسين والمدربين **في نفس المنطقة الجغرافية**.

الفكرة الأساسية: **«الجيرة التعليمية»** — خلي الوصول للدروس الخصوصية سهل وقريب.

### أنواع الحصص المدعومة:
| النوع | الوصف |
|-------|-------|
| **أونلاين** | دروس عبر الإنترنت |
| **عند المتعلم** | المدرس يروح للطالب |
| **عند المدرس** | الطالب يروح للمدرس |
| **في مكان مخصص** | مركز أو قاعة |

### المستخدمين الأساسيين (3 أنواع):
1. **العميل/المتعلم** (`parent`) — بيدور على مدرسين، بيدير أولاده، بيبعت طلبات تواصل
2. **المدرس** (`teacher`) — بيدير ملفه الشخصي، المواد والأسعار، بيستقبل طلبات
3. **الأدمن** (`admin`) — بيدير المنصة بالكامل

---

## 🧱 هيكل المشروع (Monorepo)

```
Zads/
├── zads-app/          ← Frontend — Next.js 16 (التطبيق اللى بيشوفه المستخدم)
├── zads-api/          ← Backend — Express.js (السيرفر اللى بيتعامل مع الداتابيز)
├── legacy/            ← كود قديم — Vue 3/Nuxt 3 (متأرشف، مش بنستخدمه)
├── .github/workflows/ ← CI/CD — GitHub Actions (نشر تلقائي)
├── learn/             ← 📚 ملفات التعلم (انت هنا!)
├── README.md          ← وصف المشروع
├── DOCUMENTATION.md   ← التوثيق الموحد
└── DEPLOY.md          ← دليل النشر
```

### ليه Monorepo؟

> **Monorepo** = كل الكود في Git repo واحد بس كل مشروع مستقل.

- ✅ سهل تشوف Frontend و Backend مع بعض
- ✅ Pull Request واحد لو عايز تغير في الاتنين
- ✅ مفيش workspaces — كل مشروع (`zads-app`, `zads-api`) ليه `pnpm-lock.yaml` مستقل
- ✅ بيتنشروا بشكل مستقل على Vercel

---

## ⚙️ Tech Stack — ليه اخترنا كل تقنية؟

### Frontend (`zads-app`)

| التقنية | الغرض | ليه اخترناها؟ |
|---------|-------|--------------|
| **Next.js 16** | إطار العمل الأساسي | App Router + SSR + API Routes + Image Optimization |
| **React 19** | مكتبة الواجهات | أكبر مجتمع، Server Components جديدة |
| **TypeScript** | لغة البرمجة | Type Safety بيقلل الأخطاء |
| **Tailwind CSS v4** | التنسيق | Utility-first سريع ومرن |
| **shadcn/ui** | مكونات UI جاهزة | مبنية على Radix، قابلة للتخصيص بالكامل |
| **Zustand** | إدارة الحالة | بسيط وخفيف، أسهل من Redux |
| **next-intl** | ترجمة | دعم عربي/إنجليزي مدمج مع App Router |
| **NextAuth.js v5** | مصادقة | Credentials provider + JWT strategy |
| **CASL** | صلاحيات | Role-based permissions (admin/teacher/parent) |
| **react-hook-form + Zod** | نماذج | Validation قوي مع TypeScript |
| **axios** | HTTP Client | Interceptors للـ auth token |

### Backend (`zads-api`)

| التقنية | الغرض | ليه اخترناها؟ |
|---------|-------|--------------|
| **Express.js** | إطار العمل الأساسي | الأكثر شيوعاً، بسيط ومرن |
| **Prisma ORM** | التعامل مع الداتابيز | Type-safe، migrations تلقائية، schema-first |
| **PostgreSQL** | قاعدة البيانات | قوية، relational، JSON support |
| **Neon** | استضافة الداتابيز | Serverless PostgreSQL، مجاني للبداية |
| **JWT** | مصادقة | Stateless authentication |
| **Zod** | التحقق من البيانات | Runtime validation + TypeScript inference |
| **Helmet** | أمان | Security headers تلقائية |
| **Multer** | رفع ملفات | File upload middleware |

---

## 🔄 كيف بيشتغلوا مع بعض؟ (Architecture Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                        المستخدم (Browser)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Next.js App (zads-app)                       │
│                   Port 3001                                  │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Pages   │  │Components│  │  Stores  │  │   Auth   │    │
│  │(App      │  │(shadcn + │  │(Zustand) │  │(NextAuth)│    │
│  │ Router)  │  │ shared)  │  │          │  │          │    │
│  └────┬─────┘  └──────────┘  └────┬─────┘  └────┬─────┘    │
│       │                           │              │           │
│       └───────────────────────────┼──────────────┘           │
│                                   │                          │
│         src/app/api/[...backend]/route.ts (BFF proxy)        │
│         /api/* → Express، ما عدا /api/auth (NextAuth)        │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP (axios)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Express API (zads-api)                         │
│                   Port 3000                                  │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Routes  │  │Controllers│ │Middleware │  │  Utils   │    │
│  │          │→ │(Logic)    │ │(Auth+Err) │  │(Response)│    │
│  └──────────┘  └────┬─────┘  └──────────┘  └──────────┘    │
│                      │                                       │
│                Prisma ORM                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │ SQL
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL (Neon Serverless)                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  19 models: users, teachers, parents, subjects,      │    │
│  │  contact_requests, tutor_requests, platform_events,   │    │
│  │  governorates, cities, areas, ...                     │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

#### 🔄 رسم توضيحي لتدفق طلب الـ Proxy (Proxy Request Flow):

```mermaid
graph LR
    Browser((المتصفح)) -->|طلب إلى /api/teachers/search| FE[Next.js App<br/>Port 3001]
    FE -->|app/api/[...backend]/route.ts| Proxy{BFF proxy}
    Proxy -->|تحويل الطلب خلف الكواليس| BE[Express API<br/>Port 3000]
    BE -->|Prisma Client| DB[(Neon Database)]
```

### تدفق الطلب (Request Flow):

1. **المستخدم** بيفتح صفحة في المتصفح → Next.js بيعرض الصفحة
2. **الصفحة** بتستخدم Zustand store عشان تجيب بيانات
3. **الـ store** بيبعت طلب HTTP عبر axios → `/api/teachers/search`
4. **Next.js** بيعمل proxy للطلب من `src/app/api/[...backend]/route.ts` → Express API على port 3000. مسار `/api/auth/*` فاضل لـ NextAuth
5. **Express** بيمر على middleware (auth → validation) → Controller
6. **Controller** بيستخدم Prisma عشان يقرأ/يكتب في PostgreSQL
7. **الرد** بيرجع في نفس المسار ← Controller ← Express ← Next.js ← المتصفح

---

## 📁 ليه رتبنا الملفات كده؟

### Frontend (`zads-app/src/`)

```
src/
├── app/           ← الصفحات (File-based routing)
│   └── [locale]/  ← كل صفحة جوا locale (en/ar) عشان الترجمة
│       ├── admin/     ← صفحات الأدمن
│       ├── auth/      ← تسجيل دخول/حساب جديد
│       ├── client/    ← لوحة العميل/المتعلم
│       ├── public/    ← الرئيسية، المدرسين، المناطق، الشروط، الخصوصية، التواصل
│       └── teacher/   ← لوحة المدرس
│
├── components/    ← المكونات المشتركة
│   ├── ui/        ← مكونات shadcn الأساسية (button, card, dialog...)
│   ├── shared/    ← مكونات خاصة بالمشروع (TeacherCard, ErrorBanner...)
│   ├── layout/    ← الـ layout (Navbar, Footer, Sidebar)
│   └── admin/     ← مكونات خاصة بالأدمن (DataTable)
│
├── stores/        ← Zustand stores (كل domain ليه store)
├── lib/           ← أدوات أساسية (auth, api, utils, ability)
├── types/         ← TypeScript interfaces
├── i18n/          ← إعدادات الترجمة + ملفات اللغات
└── hooks/         ← Custom hooks (فاضي حالياً)
```

**الفلسفة:**
- 📂 **Feature-based في الصفحات:** كل portal (admin/client/teacher) ليه folder مستقل
- 📂 **Type-based في المكونات:** `ui/` للأساسيات، `shared/` للمشترك، `layout/` للهيكل
- 📂 **Domain-based في الـ stores:** كل feature ليها store (auth, search, favorites...)

### Backend (`zads-api/src/`)

```
src/
├── app.js             ← نقطة الدخول — إعداد Express + middleware + routes
├── config/            ← إعدادات (database, env, firebase)
├── routes/            ← تعريف المسارات (13 ملف، 1:1 مع controllers)
├── controllers/       ← منطق الأعمال (business logic)
├── middlewares/        ← auth + error handler + validation
├── services/          ← خدمات (notifications فقط حالياً)
└── utils/             ← أدوات مساعدة (response format, validators)
```

**الفلسفة:**
- 📂 **MVC-like بدون Model layer:** Routes → Controllers → Prisma مباشرة
- 📂 **1:1 mapping:** كل route file ليه controller file مقابل
- 📂 **Thin middleware:** Auth و Error handling و Validation في middlewares/
- 📂 **Centralized config:** كل الإعدادات في config/

---

## 🚀 النشر (Deployment)

```
┌─────────────────────────────────────────────────┐
│                   GitHub                         │
│                                                  │
│  Push to main                                    │
│  ├── zads-app/** changed → deploy-app.yml        │
│  └── zads-api/** changed → deploy-api.yml        │
└────────┬──────────────────────┬──────────────────┘
         │                      │
         ▼                      ▼
┌────────────────┐    ┌────────────────┐
│   Vercel       │    │   Vercel       │
│   zads.app     │    │ api.zads.app   │
│   (Next.js)    │    │ (Express)      │
└────────────────┘    └────────────────┘
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────┐
         │  Neon PostgreSQL  │
         │  (Serverless)     │
         └──────────────────┘
```

- كل push على `main` بيشغل GitHub Action تلقائياً
- Vercel بينشر كل مشروع لوحده
- Neon بتوفر PostgreSQL serverless (بتقفل لما مفيش traffic)

---

## 🔑 المتغيرات البيئية (Environment Variables)

### الملفات المهمة:
- 📄 [`.env.example`](file:///Users/sayed/Devs/Zads/zads-api/.env.example) — متغيرات الـ API
- 📄 [`.env.local.example`](file:///Users/sayed/Devs/Zads/zads-app/.env.local.example) — متغيرات الـ Frontend

### أهم المتغيرات:

| المتغير | المكان | الغرض |
|---------|--------|-------|
| `DATABASE_URL` | API | رابط PostgreSQL (pooled — لحركة التطبيق) |
| `DIRECT_URL` | API | رابط PostgreSQL (direct — للـ migrations) |
| `JWT_SECRET` | API | مفتاح توقيع JWT |
| `NEXT_PUBLIC_API_BASE_URL` | App | رابط الـ API العام |
| `NEXTAUTH_SECRET` | App | مفتاح NextAuth |

---

## 📚 خريطة الملفات المهمة — ابدأ من هنا

### ابدأ بالفهم العام:
1. 📄 [README.md](file:///Users/sayed/Devs/Zads/README.md) — وصف المشروع
2. 📄 [DOCUMENTATION.md](file:///Users/sayed/Devs/Zads/DOCUMENTATION.md) — التوثيق الكامل
3. 📄 [DEPLOY.md](file:///Users/sayed/Devs/Zads/DEPLOY.md) — كيفية النشر

### Frontend (الأهم أولاً):
1. 📄 [next.config.ts](../../zads-app/next.config.ts) — الصور وإضافة الترجمة والتحويلات القديمة. بروكسي الـ API في `src/app/api/[...backend]/route.ts`
2. 📄 [layout.tsx](file:///Users/sayed/Devs/Zads/zads-app/src/app/[locale]/layout.tsx) — الـ layout الأساسي
3. 📄 [auth.ts](file:///Users/sayed/Devs/Zads/zads-app/src/lib/auth.ts) — إعدادات المصادقة
4. 📄 [api.ts](file:///Users/sayed/Devs/Zads/zads-app/src/lib/api.ts) — Axios instance
5. 📄 [globals.css](file:///Users/sayed/Devs/Zads/zads-app/src/app/globals.css) — التنسيقات العامة

### Backend (الأهم أولاً):
1. 📄 [app.js](file:///Users/sayed/Devs/Zads/zads-api/src/app.js) — نقطة الدخول
2. 📄 [schema.prisma](file:///Users/sayed/Devs/Zads/zads-api/prisma/schema.prisma) — هيكل الداتابيز
3. 📄 [auth.js](file:///Users/sayed/Devs/Zads/zads-api/src/middlewares/auth.js) — middleware المصادقة
4. 📄 [auth.controller.js](file:///Users/sayed/Devs/Zads/zads-api/src/controllers/auth.controller.js) — منطق المصادقة
5. 📄 [response.js](file:///Users/sayed/Devs/Zads/zads-api/src/utils/response.js) — تنسيق الردود

---

## ⏭️ الخطوة التالية

لو بتكمل من frontend لـ fullstack، ابدأ [00-fullstack-path.md](./00-fullstack-path.md). متبدأش بملف React.

مرجع الكود، بالترتيب، لو حابب تقرأ المشروع كله:

1. 📗 [01-nextjs-react.md](./01-nextjs-react.md) — Next.js و React في المشروع (مش أول خطوة ليك)
2. 📙 [02-expressjs-node.md](./02-expressjs-node.md) — Express.js و Node.js
3. 📘 [03-postgresql-prisma.md](./03-postgresql-prisma.md) — PostgreSQL و Prisma
4. 🚀 [04-platform-now.md](./04-platform-now.md) — المنتج الحالي

</div>

