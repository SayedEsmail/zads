# Zads codebase overview

This is a **code-grounded** map of the repo structure, entry points, and the main execution/data flows. It focuses on **source-of-truth** files and ignores generated artifacts like `zads_web/.nuxt/` unless you’re debugging build/runtime.

## Tech stack & entry points

- **Web app (primary)**: `zads_web/` — Nuxt 3 + Vuetify 3 + Pinia + CASL + `@sidebase/nuxt-auth` + `@nuxtjs/i18n`
  - Entry: `zads_web/app.vue`
  - Config: `zads_web/nuxt.config.ts`
  - Pages (routing): `zads_web/pages/**`
  - Global route gating: `zads_web/middleware/acl.global.js`
  - API wrapper: `zads_web/utils/api.js` (Nuxt `$fetch` with Authorization header)
  - Pinia stores: `zads_web/stores/**`

- **Backend API**: `zads-api/` — Node.js + Express + Prisma + Postgres + JWT
  - Entry: `zads-api/src/app.js` (mounts all REST routes under `/api/*`)
  - Auth routes: `zads-api/src/routes/auth.routes.js`
  - Auth middleware + role guards: `zads-api/src/middlewares/auth.js`

- **Admin dashboard**: `zads-dashboard/` — Vue 3 + Vuetify 3 + Vite + Pinia
  - Entry: `zads-dashboard/src/main.js`
  - Vite config: `zads-dashboard/vite.config.js`

## Repo map

Top-level apps (per `README.md`):

- `zads_web/`: parents + teachers web experience (Phase 1 focus)
- `zads-api/`: REST API + Prisma/Postgres
- `zads-dashboard/`: admin UI (teachers/parents/subjects/stages/requests)
- `zads_app/`: Flutter app (paused, mentioned in root `README.md`)

## Build / dev / test (what matters)

From root `README.md`:

- **API**:
  - `cd zads-api && npm install`
  - `cp .env.example .env`
  - `npx prisma migrate dev`
  - `npx prisma db seed`
  - `npm run dev`

- **Web**:
  - `cd zads_web && pnpm install`
  - `cp .env.example .env`
  - `pnpm dev`

- **Dashboard**:
  - `cd zads-dashboard && pnpm install`
  - `cp .env.example .env`
  - `pnpm dev`

## Key flows (how requests move through the system)

### Web routing & layouts (Nuxt)

- File-based routes live under `zads_web/pages/`.
  - Parent area: `zads_web/pages/parent/**`
  - Teacher area: `zads_web/pages/teacher/**`
  - Public pages: `zads_web/pages/index.vue`, `about.vue`, `how-it-works.vue`, `login.vue`, `register/**`
- Root render path: `zads_web/app.vue` → `<NuxtLayout>` → `<NuxtPage />`.

### Auth + role gating

- API issues JWT, web stores it in cookies (see `zads_web/stores/auth.js`).
- Global navigation gating is done in `zads_web/middleware/acl.global.js` using CASL `canNavigate(to)` and auth state.
- Backend validates JWT and attaches `req.user` in `zads-api/src/middlewares/auth.js`, plus role guards:
  - `isTeacher`, `isParent`, `isAdmin`

### Data fetching

- Web uses a `$fetch` client with an Authorization header set from cookies: `zads_web/utils/api.js`.
- Web dashboards show typical store-driven flow:
  - Parent dashboard: `zads_web/pages/parent/index.vue` calls `parentStore.fetchProfile()`, `childrenStore.fetchChildren()`, `tutorRequestsStore.fetchMyRequests()`, `contactRequestsStore.fetchMyRequests()`
  - Teacher dashboard: `zads_web/pages/teacher/index.vue` calls `teacherStore.fetchProfile()`, `teacherStore.fetchStats()`, `contactRequestsStore.fetchIncomingRequests()`, then fetches local tutor requests
- API endpoints are mounted in `zads-api/src/app.js`:
  - `/api/auth`, `/api/teachers`, `/api/parents`, `/api/subjects`, `/api/stages`, `/api/favorites`, `/api/contact-requests`, `/api/tutor-requests`, `/api/admin`, `/api/locations`, `/api/upload`, `/api/notifications`, `/api/analytics`

## Where to change X (common edits)

- **Add or change a page/route (web)**: `zads_web/pages/**`
- **Change parent/teacher dashboards**:
  - Parent: `zads_web/pages/parent/index.vue`
  - Teacher: `zads_web/pages/teacher/index.vue`
- **Change auth behavior (web)**: `zads_web/stores/auth.js`, `zads_web/middleware/acl.global.js`
- **Change API base URL / auth header injection (web)**: `zads_web/utils/api.js`
- **Change theme colors (web)**: `zads_web/plugins/vuetify/theme.js`
- **Add/edit REST endpoints (api)**:
  - Add route file: `zads-api/src/routes/*.routes.js`
  - Add controller logic: `zads-api/src/controllers/*.controller.js`
  - Add/adjust auth/role checks: `zads-api/src/middlewares/auth.js`
- **Admin dashboard entry / plugin wiring**: `zads-dashboard/src/main.js` and `zads-dashboard/src/@core/**` (via `registerPlugins`)

## Risks / footguns to know early

- **Generated files**: `zads_web/.nuxt/**` is generated. Avoid editing/committing it unless you explicitly intend to (it’s currently modified in git status).
- **Port mismatch**:
  - Root `README.md` says web runs on `http://localhost:3001`
  - `zads_web/nuxt.config.ts` sets `devServer.port = 4000`
  - `zads_web/nuxt.config.ts` also sets `auth.baseURL = 'http://localhost:4000/api/auth'`
  - If you see auth/API calls hitting the wrong host/port, start by reconciling these.
- **Cookie naming mismatch (web)**:
  - `zads_web/utils/api.js` attaches `Authorization` from cookie `accessToken`
  - `zads_web/stores/auth.js` stores the token in cookie `token`
  - If requests are missing auth headers, this is the first thing to align.

## Quick route inventory (web)

Not exhaustive, but the current `pages/` includes:

- Public: `/`, `/about`, `/how-it-works`, `/login`, `/forgot-password`, `/register/*`
- Parent: `/parent`, `/parent/profile`, `/parent/children`, `/parent/favorites`, `/parent/requests`, `/parent/settings`, `/parent/teacher/[id]`
- Teacher: `/teacher`, `/teacher/profile`, `/teacher/subjects`, `/teacher/requests`, `/teacher/settings`, `/teacher/browse`

