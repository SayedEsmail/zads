# Zads — unified technical plan

This is the **single technical plan** for the whole repository (web + API + dashboard).  
Companion docs:

- `CODEBASE_OVERVIEW.md` (repo/architecture map)
- `FEATURES_OVERVIEW.md` (feature map grounded in routes/stores/endpoints)
- `DOCUMENTATION.md` (unified product + platform documentation)

## 1) System overview

**Apps**

- **Web app (parents + teachers)**: `zads_web/` (Nuxt 3, Vuetify 3, Pinia, i18n, CASL, `@sidebase/nuxt-auth`)
- **API**: `zads-api/` (Node/Express, Prisma, PostgreSQL, JWT, Zod)
- **Admin dashboard**: `zads-dashboard/` (Vue 3, Vuetify 3, Vite, Pinia, Axios)
- **Mobile**: `zads_app/` (paused)

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

