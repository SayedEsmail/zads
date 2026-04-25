# Zads feature overview (code-grounded)

This document maps **what the app does** to **real routes + key files** (pages, stores, and API endpoints). It focuses on the Phase 1 web app (`zads_web/`) plus the admin dashboard (`zads-dashboard/`).

---

## Product context (what Zads is)

**Zads** is a local education community: it connects people who want to learn (for themselves or for dependants) with teachers in the **same city/area**—**«الجيرة التعليمية»**. See **[DOCUMENTATION.md](./DOCUMENTATION.md)** for the full non-technical story, benefits for clients and teachers, and the **four session modes** (online; at learner’s home; at teacher’s home; dedicated venue / center).

### How the “where / how” of a session appears in code (today)

- Prisma **`LessonType`** (`zads-api/prisma/schema.prisma`): `at_teacher` (at teacher’s place), `at_student` (at learner’s place), `group` (often used for group / center-style context), `any`.  
- **Tutor requests** and **teacher subject** rows use `LessonType` and related fields to express preferred or offered formats.  
- A clearer product split for **online vs offline** and pricing per mode is on the **platform roadmap** (see migration plan: `requestTarget`, `studyMode`, `priceOnline` / `priceOffline`).

This file below stays **route- and file-accurate**; names like **Parent** and `/parent/*` are what the code uses today, while product language is moving toward **client / learner** and **dependents**.

---

## Personas / roles

Derived from route structure (`zads_web/pages/**`) + API role guards (`zads-api/src/middlewares/auth.js`):

- **Public/Visitor**: can browse marketing pages and auth screens.
- **Parent** (`userType=parent`): manages children, searches teachers, favorites, tutor requests, contact requests.
- **Teacher** (`userType=teacher`): manages profile + subjects/pricing, views incoming contact requests, browses local tutor requests.
- **Admin** (`userType=admin`): uses the dashboard to manage platform entities (teachers/parents/subjects/stages/requests).

## Feature areas (by domain)

### Public / marketing

- **Screens / routes**
  - `/` → `zads_web/pages/index.vue`
  - `/about` → `zads_web/pages/about.vue`
  - `/how-it-works` → `zads_web/pages/how-it-works.vue`

### Authentication & account

- **Screens / routes**
  - `/login` → `zads_web/pages/login.vue`
  - `/forgot-password` → `zads_web/pages/forgot-password.vue`
  - `/register` → `zads_web/pages/register/index.vue`
  - `/register/parent` → `zads_web/pages/register/parent.vue`
  - `/register/teacher` → `zads_web/pages/register/teacher.vue`
- **Web implementation**
  - Auth state + login/register/profile update: `zads_web/stores/auth.js`
  - App bootstrapping auth from cookies: `zads_web/plugins/auth.js`
  - Route gating / redirect by role: `zads_web/middleware/acl.global.js`
- **API touchpoints**
  - `POST /api/auth/login` → `zads-api/src/routes/auth.routes.js`
  - `POST /api/auth/register/parent|teacher`
  - `GET/PUT /api/auth/profile`

### Parent: dashboard

- **Screens / routes**
  - `/parent` → `zads_web/pages/parent/index.vue`
- **Data touchpoints (stores)**
  - `zads_web/stores/parent.js` (profile)
  - `zads_web/stores/children.js` (children)
  - `zads_web/stores/tutorRequests.js` (my tutor requests)
  - `zads_web/stores/contactRequests.js` (my contact requests/messages)

### Parent: manage children

- **Screens / routes**
  - `/parent/children` → `zads_web/pages/parent/children.vue`
  - (Also embedded in settings) `/parent/settings` → `zads_web/pages/parent/settings.vue`
- **Web implementation**
  - Store: `zads_web/stores/children.js`
  - Reference data (stages/subjects): `zads_web/stores/search.js` (`fetchSubjects`, `fetchStages`)
- **API touchpoints**
  - `GET/POST /api/parents/me/children`
  - `PUT/DELETE /api/parents/me/children/:childId`
  - Routes: `zads-api/src/routes/parents.routes.js`

### Parent: find teachers + teacher profile

- **Screens / routes**
  - (Search/landing for parents) `/parent` → `zads_web/pages/parent/index.vue`
  - Teacher detail: `/parent/teacher/[id]` → `zads_web/pages/parent/teacher/[id].vue`
- **Web implementation**
  - Search + filters + reference data: `zads_web/stores/search.js`
  - Teacher details fetch: `zads_web/pages/parent/teacher/[id].vue` uses `api.get('/teachers/:id')`
- **API touchpoints**
  - `GET /api/teachers/search` (and `GET /api/teachers`) → `zads-api/src/routes/teachers.routes.js`
  - `GET /api/teachers/:id`
  - Reference data: `GET /api/subjects`, `GET /api/stages`, `GET /api/locations/*`

### Parent: favorites

- **Screens / routes**
  - `/parent/favorites` → `zads_web/pages/parent/favorites.vue`
- **Web implementation**
  - Store: `zads_web/stores/favorites.js`
- **API touchpoints**
  - `GET /api/favorites`
  - `POST /api/favorites` (add `{teacherId}`)
  - `DELETE /api/favorites/:teacherId`
  - Routes: `zads-api/src/routes/favorites.routes.js`

### Parent: tutor requests + contact requests (messaging)

- **Screens / routes**
  - `/parent/requests` → `zads_web/pages/parent/requests/index.vue`
- **What it does**
  - Create/manage “tutor requests” (subject, stage, description, budget, lesson type).
  - Send “contact requests” to teachers and track replies/acceptance.
- **Web implementation**
  - Stores:
    - `zads_web/stores/tutorRequests.js` (`/tutor-requests`, `/tutor-requests/my`, close/delete)
    - `zads_web/stores/contactRequests.js` (`/contact-requests/my`, create)
  - Uses reference data: `zads_web/stores/search.js` (`subjects`, `stages`)
- **API touchpoints**
  - Tutor requests: `zads-api/src/routes/tutorRequests.routes.js`
  - Contact requests: `zads-api/src/routes/contactRequests.routes.js`

### Parent: settings & profile

- **Screens / routes**
  - `/parent/profile` → `zads_web/pages/parent/profile.vue`
  - `/parent/settings` → `zads_web/pages/parent/settings.vue`
- **What it includes (from code)**
  - Update account info (name/phone/password) via auth store
  - Update location (areaId) via parent store
  - Manage children + subjects mapping
- **Web implementation**
  - `zads_web/pages/parent/settings.vue`
  - Stores: `zads_web/stores/auth.js`, `zads_web/stores/parent.js`, `zads_web/stores/children.js`, `zads_web/stores/search.js`
- **API touchpoints**
  - `PUT /api/auth/profile`
  - `GET/PUT /api/parents/me`
  - `GET /api/locations/*` (governorates/cities/areas)

### Teacher: dashboard

- **Screens / routes**
  - `/teacher` → `zads_web/pages/teacher/index.vue`
- **What it does (from code)**
  - Shows stats, recent incoming contact requests, and local tutor requests (based on teacher’s area)
- **Web implementation**
  - Stores: `zads_web/stores/teacher.js`, `zads_web/stores/contactRequests.js`, `zads_web/stores/tutorRequests.js`
- **API touchpoints**
  - `GET /api/teachers/me`, `GET /api/teachers/me/stats`
  - `GET /api/contact-requests/incoming`
  - `GET /api/tutor-requests` (teacher-browse, area-filtered)

### Teacher: browse tutor requests (opportunities)

- **Screens / routes**
  - `/teacher/browse` → `zads_web/pages/teacher/browse.vue`
- **Web implementation**
  - Uses `zads_web/stores/tutorRequests.js` + `zads_web/stores/search.js` + `zads_web/stores/teacher.js`
- **API touchpoints**
  - `GET /api/tutor-requests` (teacher-only; guarded) → `zads-api/src/routes/tutorRequests.routes.js`
  - `GET /api/locations/governorates` (+ cities/areas)

### Teacher: subjects & pricing

- **Screens / routes**
  - `/teacher/subjects` → `zads_web/pages/teacher/subjects.vue`
- **Web implementation**
  - Store: `zads_web/stores/teacherSubjects.js`
  - Uses reference data: `zads_web/stores/search.js`
- **API touchpoints**
  - `GET/POST /api/teachers/me/subjects`
  - `PUT /api/teachers/me/subjects/:teacherSubjectId`
  - Routes: `zads-api/src/routes/teachers.routes.js`

### Teacher: contact requests + manage statuses

- **Screens / routes**
  - `/teacher/requests` → `zads_web/pages/teacher/requests.vue`
- **Web implementation**
  - Store: `zads_web/stores/contactRequests.js` (`fetchIncomingRequests`, `updateRequestStatus`)
  - Also shows general tutor requests list via `zads_web/stores/tutorRequests.js`
- **API touchpoints**
  - `GET /api/contact-requests/incoming`
  - `PATCH /api/contact-requests/:requestId/status`
  - `GET /api/tutor-requests`

### Teacher: profile & settings

- **Screens / routes**
  - `/teacher/profile` → `zads_web/pages/teacher/profile.vue`
  - `/teacher/settings` → `zads_web/pages/teacher/settings.vue`
- **Web implementation**
  - Profile: `zads_web/stores/teacher.js` + `zads_web/stores/search.js` (location drill-down)
  - Avatar upload goes through `zads_web/stores/auth.js` (`uploadAvatar`)
- **API touchpoints**
  - `GET/PUT /api/teachers/me`
  - `POST /api/upload/image` (used by avatar upload)
  - `GET /api/locations/*`
  - `PUT /api/auth/profile` (account info change)

## Admin dashboard (zads-dashboard)

This is a separate Vue 3 + Vite app with its own screens:

- `/login` → `zads-dashboard/src/pages/login.vue`
- `/` dashboard → `zads-dashboard/src/pages/index.vue`
- Teachers → `zads-dashboard/src/pages/teachers.vue`
- Parents → `zads-dashboard/src/pages/parents.vue`
- Subjects → `zads-dashboard/src/pages/subjects.vue`
- Stages → `zads-dashboard/src/pages/stages.vue`
- Tutor requests → `zads-dashboard/src/pages/tutor-requests.vue`
- Contact requests → `zads-dashboard/src/pages/contact-requests.vue`

API side for admin is mounted under `/api/admin` in `zads-api/src/app.js` (see `zads-api/src/routes/admin.routes.js` for exact endpoints).

## Gaps / TODOs spotted (from code)

- Teacher “contact parent” action is explicitly marked as “coming soon” in `zads_web/pages/teacher/requests.vue` (`handleContactParent` shows an info snackbar).

