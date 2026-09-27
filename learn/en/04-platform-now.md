# 🚀 Zads Platform Now — What the Product Actually Does

> **Goal of this file:** Map the current Zads product onto the code. Modules 01–03 teach Next.js, Express, and Prisma. This file is the product layer that landed on top of that stack: public discovery, privacy, contact rules, analytics, and the same-origin API proxy.
<blockquote dir="rtl">

*الملفات اللي فاتت بتعلمك الأدوات. الملف ده بيقولك المنصة نفسها بقت عاملة إزاي دلوقتي، وفين كل حاجة في الكود.*

</blockquote>

The product handbook is [DOCUMENTATION.md](../../DOCUMENTATION.md). Read this file first if you want the learning path, then use the handbook when you need the full route table.

---

## 📌 Product rules that the code enforces

**Zads is a direct connection platform, not a tutoring center.** Teachers set their own prices. The platform does not take a commission from lesson fees.

Launch geography is **6th of October** and **Sheikh Zayed** (Giza), with bilingual pages (`/en` and `/ar`).

Anyone can browse teachers before they create an account. Accounts are still three roles in the database:

| Role in code | What the UI calls them | What they do |
|--------------|------------------------|--------------|
| `parent` | Client / learner | Search, favorites, children, contact requests, “I need a tutor” posts |
| `teacher` | Teacher | Profile, subjects and prices, weekly availability, incoming requests |
| `admin` | Admin | Verify teachers, suspend accounts, audit contact and tutor requests |

A client account can be a `student` or a `guardian` (`Parent.clientAccountKind`). A tutor request can target `self` or a `dependent`.

Lesson placement is stored separately from “online vs in person”:

| Field | Values | Meaning |
|-------|--------|---------|
| `studyMode` | `online`, `offline`, `both` | How the lesson is delivered |
| `teachingPlace` / `LessonType` | `at_teacher`, `at_student`, `group`, `online` | Where it happens |
| `TeacherSubject` prices | `priceOnline`, `priceOffline`, `priceAtTeacher`, `priceAtStudent`, `priceGroup` | What the teacher charges for each option |

<blockquote dir="rtl">

*متخلطش بين طريقة الحصة (أونلاين ولا أوفلاين) ومكانها (عند المدرس ولا عند الطالب). الاتنين حقول مختلفة.*

</blockquote>

---

## 🌐 Public site (no login)

These pages live under `zads-app/src/app/[locale]/public/`.

| Page | Path | Why it exists |
|------|------|----------------|
| Landing | `/public` | Neighborhood story and how to start |
| Teacher search | `/public/teachers` | Filters, cards, no account required |
| Teacher profile | `/public/teachers/[id]` | Bio, subjects, prices, verified badge. Phone is stripped |
| Join as teacher | `/public/join-teacher` | Zero-commission explanation and registration CTA |
| About / How it works | `/public/about`, `/public/how-it-works` | Mission and the 3-step connect flow |
| Area pages | `/public/areas/6th-of-october`, `/public/areas/sheikh-zayed` | Local SEO landing pages |
| Terms / Privacy / Contact | `/public/terms`, `/public/privacy`, `/public/contact` | Honest policies and support |

Search and public profiles call `GET /api/teachers` and `GET /api/teachers/:id`. Those handlers must not return phone numbers.

SEO helpers:

- `zads-app/src/app/sitemap.ts` — public URLs for both locales
- `zads-app/src/app/robots.ts` — crawl rules
- Per-page `layout.tsx` files under public routes set titles and descriptions

Legacy URLs still work. `next.config.ts` permanently redirects `/parent/*` to `/client/*`, old marketing paths to `/public/*`, and doubled homes such as `/client/client` back to `/client`.

---

## 🔒 Privacy contracts

These rules are product behavior, not comments.

1. **Public discovery** returns name, avatar, bio, subjects, prices, and availability. It does not return the teacher’s phone.
2. **Certificates** are not public files. Only the owning teacher and an admin can open them.
3. **Contact phones stay hidden** while a request is `pending` or `rejected`. Both sides see phone numbers only after `status === 'accepted'`.
4. **The person who started the request cannot accept or reject it.** The other party decides.
5. **A second pending request** between the same parent, teacher, and subject is rejected with `409`. The database also has a partial unique index on pending rows, plus an optional `idempotencyKey` so a double-click does not create two rows.

Egyptian mobiles (`010`, `011`, `012`, `015`, with or without `+20` / `0020`) are normalized to `01xxxxxxxxx` before lookup or save. Password changes require the current password.

Read this in:

- `zads-api/src/controllers/teachers.controller.js` — public select, no phone
- `zads-api/src/controllers/contactRequests.controller.js` — status machine and phone reveal
- `zads-api/src/utils/validators.js` — phone normalization
- `zads-api/tests/z04-z08-privacy-contracts.test.js` — the contracts as tests

---

## 🔁 How the browser reaches the API

The browser talks to Next.js on port **3001**. Express stays on port **3000**. Same-origin calls go through a route handler, not a `next.config.ts` rewrite.

```
Browser  →  /api/teachers/search
         →  zads-app/src/app/api/[...backend]/route.ts
         →  Express  API_BASE_URL/api/teachers/search
         →  Prisma  →  PostgreSQL
```

That handler:

- Forwards `/api/*` except `/api/auth/*` (NextAuth owns auth).
- Drops the browser `Cookie` header so the NextAuth session cookie is not sent upstream. The API token travels in `Authorization`.
- Strips Helmet and compression headers from the upstream response so the browser does not fail to decode the body.

`next.config.ts` still owns image hosts and legacy redirects. It does not proxy the API.

Role gates for pages live in `zads-app/src/proxy.ts`: `/client` requires `parent`, `/teacher` requires `teacher`, `/admin` requires `admin`.

---

## 📊 Analytics and attribution

Two layers, on purpose.

**Google Analytics 4** in the browser (`zads-app/src/lib/analytics.ts`, `GoogleAnalytics.tsx`):

- Measurement ID from `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- Events: `sign_up_teacher`, `sign_up_parent`, `contact_request`, `contact_support`, `view_teacher_profile`, `join_teacher_cta`
- The gtag snippet is loaded in the document head so collection starts on the first page view

**First-party events** in Postgres (`PlatformEvent`, table `platform_events`):

| Endpoint | Auth | What it stores |
|----------|------|----------------|
| `POST /api/analytics/event` | Optional | Named funnel event, session, optional user |
| `POST /api/analytics/attribution` | Optional | Campaign / referrer context (`AttributionTracker.tsx`) |
| `POST /api/analytics/contact-click` | Logged in | A real contact action |
| `POST /api/analytics/whatsapp-click` | Optional | WhatsApp click, also written to `whatsapp_clicks` |

`dedupKey` is unique so the same event is not inserted twice.

---

## 🔔 Push, admin, and uploads

- Teachers and clients can store an FCM token: `POST /api/auth/fcm-token` and `POST /api/notifications/register-token`.
- The browser service worker is `zads-app/public/firebase-messaging-sw.js`. `PushNotificationRegistrar.tsx` registers it after login.
- Admins verify a teacher with `PATCH /api/admin/teachers/:teacherId/verify` (`isVerified`, `verifiedAt`, `verifiedBy`, `verificationNotes`).
- Admins list and audit contact requests at `/admin/contact-requests`.
- Images and certificates upload through `POST /api/upload/image` and `POST /api/upload/certificate`.

---

## 🗄️ Schema additions you will not see in the early chapters

`schema.prisma` now has **19 models**. The nineteenth is `PlatformEvent`.

`ContactRequest` also carries the coordination fields the product needs:

`replyMessage`, `initiatedBy`, `studyMode`, `teachingPlace`, `preferredTime`, `tutorRequestId`, `idempotencyKey`.

Recent migrations:

- `20260926160000_complete_platform_contracts` — verification, study mode, teaching place, availability, account kind
- `20260926170000_contact_idempotency_and_analytics_funnel` — `idempotency_key`, `platform_events`, one pending request per parent/teacher/subject

Apply them with `npx prisma migrate deploy`. Do not reset a shared database to “catch up.”

API checks that lock this behavior live in `zads-api/tests/` (`z03-admin-contracts`, `z04-z08-privacy-contracts`, `e2e-complete-flow`). The public pages have a smoke script at `zads-app/tests/public-discovery.cjs`.

---

## 🗺️ Where to look when you change a feature

| If you change… | Open… |
|----------------|--------|
| A public page or SEO text | `zads-app/src/app/[locale]/public/` and `src/i18n/locales/{en,ar}.json` |
| Search or a teacher card | `teachers.controller.js` and `src/stores/search.ts` |
| Who can see a phone number | `contactRequests.controller.js` and the privacy tests |
| A dashboard API call | `src/lib/api.ts` and `src/app/api/[...backend]/route.ts` |
| A new table or column | `schema.prisma`, then a new folder under `prisma/migrations/` |

---

## ⏭️ You are caught up

1. 📗 [01-nextjs-react.md](./01-nextjs-react.md) — App Router, stores, auth, i18n
2. 📙 [02-expressjs-node.md](./02-expressjs-node.md) — Routes, middleware, controllers
3. 📘 [03-postgresql-prisma.md](./03-postgresql-prisma.md) — Schema, relations, Neon
4. 🚀 This file — the platform as it ships today

Product detail beyond this learning path: [DOCUMENTATION.md](../../DOCUMENTATION.md).
