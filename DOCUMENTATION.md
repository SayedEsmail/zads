# Zads — unified documentation

This is the **single documentation file** for the whole repository (product + platform).  
Canonical technical references:

- `TECH_PLAN.md` (unified technical plan)
- `CODEBASE_OVERVIEW.md` (repo map)
- `FEATURES_OVERVIEW.md` (feature map)

## 1) Platform overview

Zads is an Egyptian marketplace connecting **parents** with **private tutors**.

**Strategy (Phase 1)**: web-first. Mobile development is paused until traction.

## 2) Applications

- `zads_web/`: parents + teachers (Nuxt 3)
- `zads-api/`: REST API (Express + Prisma + Postgres)
- `zads-dashboard/`: admin dashboard (Vue 3 + Vite)
- `zads_app/`: mobile app (paused)

## 3) User types & capabilities

- **Parent (ولي أمر)**:
  - Manage children (stage + subjects)
  - Search/browse teachers
  - Favorites
  - Create/manage tutor requests
  - Send contact requests to teachers
- **Teacher (معلم)**:
  - Create/update profile (bio, qualification, location, lesson types)
  - Manage subjects + pricing
  - View incoming contact requests and accept/reject
  - Browse tutor requests (opportunities) near their area
  - View stats (views, contacts, rating)
- **Admin (مدير)**:
  - Manage teachers/parents/users
  - CRUD subjects + stages
  - View requests (contact + tutor)

## 4) Core feature map (where to look in code)

For the full map, see `FEATURES_OVERVIEW.md`. Highlights:

- **Auth**: `zads_web/pages/login.vue`, `zads_web/stores/auth.js`, `zads-api/src/routes/auth.routes.js`
- **Parent dashboard**: `zads_web/pages/parent/index.vue`
- **Children management**: `zads_web/pages/parent/children.vue`, API in `zads-api/src/routes/parents.routes.js`
- **Teacher search**: `zads_web/stores/search.js`, API `GET /api/teachers/search`
- **Teacher profile view**: `zads_web/pages/parent/teacher/[id].vue`, API `GET /api/teachers/:id`
- **Favorites**: `zads_web/stores/favorites.js`, API `/api/favorites`
- **Tutor requests**: `zads_web/stores/tutorRequests.js`, API `/api/tutor-requests`
- **Contact requests**: `zads_web/stores/contactRequests.js`, API `/api/contact-requests`
- **Admin dashboard pages**: `zads-dashboard/src/pages/*.vue`

## 5) Important behavior / rules

- **Auto tutor-request creation**: when a parent adds a child with subjects, the API auto-creates tutor requests per subject (implemented in `zads-api/src/controllers/parents.controller.js`).

## 6) Local running (quick)

Use the root `README.md` for step-by-step commands. The canonical technical notes live in `TECH_PLAN.md`.

