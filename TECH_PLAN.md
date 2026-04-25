# Zads — unified technical plan

This is the **single technical plan** for the whole repository (web + API + dashboard).  
Companion docs:

- `DOCUMENTATION.md` (product story + platform — **read first for “what is Zads?”**)
- `CODEBASE_OVERVIEW.md` (repo/architecture map)
- `FEATURES_OVERVIEW.md` (feature map grounded in routes/stores/endpoints)

## 1) System overview

**Product (non-technical)**  
Zads is a local learning community (**«الجيرة التعليمية»**) connecting anyone who wants to learn with teachers in the same area, with flexible session placement (online; at learner’s home; at teacher’s home; dedicated venue). Client-facing benefits (discovery, household/dependents, tutor requests, favorites) and teacher benefits (local visibility, opportunities, pricing control, stats) are described in **`DOCUMENTATION.md`**.

**Apps**

- **Web app (clients + teachers)**: `zads_web/` (Nuxt 3, Vuetify 3, Pinia, i18n, CASL, `@sidebase/nuxt-auth`) — API role for the client area is still `parent` in code; routes under `/parent/*`
- **API**: `zads-api/` (Node/Express, Prisma, PostgreSQL, JWT, Zod)
- **Admin dashboard**: `zads-dashboard/` (Vue 3, Vuetify 3, Vite, Pinia, Axios)
- **Mobile app**: not present in this repository (web-first)

**Planned**  
A single **Next.js + TypeScript** app to replace the web + dashboard, and API/schema evolution (client/learner model, dependants, `requestTarget` / `studyMode`, online/offline pricing) — see the Cursor plan `react_migration_tasks_add84281.plan.md` in `.cursor/plans/` when available.

**High-level architecture**

Web + Dashboard → REST API (`zads-api`) → PostgreSQL (Prisma).

## 2) Local development

### API

From `zads-api/README.md`:

```bash
cd zads-api
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

API: `http://localhost:3000` (base: `http://localhost:3000/api`)

### Web

From `zads_web/README.md`:

```bash
cd zads_web
pnpm install
cp .env.example .env
pnpm dev
```

**Note**: `zads_web/nuxt.config.ts` sets `devServer.port = 4000`. If you still expect `3001`, reconcile docs/config.

### Dashboard

From `zads-dashboard/README.md`:

```bash
cd zads-dashboard
pnpm install
cp .env.example .env
pnpm dev
```

Dashboard: `http://localhost:5173`

## 3) Web app (Nuxt) technical design

### Routing / surfaces

- File-based routes: `zads_web/pages/**`
- Root render: `zads_web/app.vue` → `<NuxtLayout>` → `<NuxtPage />`

### Auth + authorization

- Auth store: `zads_web/stores/auth.js`
- Auth bootstrapping: `zads_web/plugins/auth.js`
- Route gating: `zads_web/middleware/acl.global.js` (CASL `canNavigate(to)` + redirect by userType)

### Data layer

- `$fetch` wrapper: `zads_web/utils/api.js`
- Stores (selected):
  - Parent: `zads_web/stores/parent.js`, `children.js`, `favorites.js`, `tutorRequests.js`, `contactRequests.js`
  - Teacher: `zads_web/stores/teacher.js`, `teacherSubjects.js`
  - Search/reference data: `zads_web/stores/search.js` (subjects/stages/locations + teacher search)

### UI/theme

- Vuetify theme tokens: `zads_web/plugins/vuetify/theme.js`
- Template: Vuexy (Nuxt) referenced by `zads_web/README.md`

## 4) API (Express) technical design

### Entry + routing

- Entry: `zads-api/src/app.js` mounts routes under:
  - `/api/auth`, `/api/teachers`, `/api/parents`, `/api/subjects`, `/api/stages`, `/api/favorites`,
    `/api/contact-requests`, `/api/tutor-requests`, `/api/admin`, `/api/locations`, `/api/upload`,
    `/api/notifications`, `/api/analytics`

### Auth model

- JWT verification + `req.user` hydration: `zads-api/src/middlewares/auth.js`
- Role guards: `isParent`, `isTeacher`, `isAdmin`

### Important behavior worth documenting

- **Auto-create tutor requests when a parent adds a child with subjects**:
  - Implemented in `zads-api/src/controllers/parents.controller.js` (`addChild`)

## 5) Admin dashboard (Vue/Vite) technical design

### Entry

- `zads-dashboard/src/main.js`
- Vite config: `zads-dashboard/vite.config.js`

### UI surfaces

- Pages: `zads-dashboard/src/pages/*.vue` (login, teachers, parents, subjects, stages, tutor-requests, contact-requests)

## 6) Known inconsistencies / cleanup targets (docs ↔ code)

- **Web dev port**: root docs often say `3001`, while `zads_web/nuxt.config.ts` sets `4000`.
- **Token cookie naming (web)**:
  - `zads_web/stores/auth.js` stores token in cookie `token`
  - `zads_web/utils/api.js` attaches auth header from cookie `accessToken`
  - Align these to avoid “missing Authorization header” bugs.

