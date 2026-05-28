# Zads (زاد) — Unified Documentation & Technical Handbook

This is the canonical handbook for the entire Zads platform. It covers product domain context, technical architecture, codebase structures, and complete feature-to-code route maps.

---

## Section 1: Product & Domain Overview

### 1.1 What is Zads?
**زاد (Zads)** is a **local learning community** that connects anyone who wants to learn—whether a student, a working adult, or a parent looking for help for their children—with teachers and trainers in the **same city and area**. The idea is **«الجيرة التعليمية»** (neighborhood learning): making access to good instruction easy and **geographically close**.

In one line: *Zads is the link between a strong teacher and a neighbor who needs a lesson, one tap away—with every reasonable option for **where and how** the session happens.*

### 1.2 Session Placement & Formats
The platform supports flexible formats for lessons. In the product, learners and teachers can work with up to **four** session modes:
1. **Online** — lessons over the internet.
2. **At the learner’s place** — the teacher comes to the learner.
3. **At the teacher’s place** — the learner goes to the teacher.
4. **At a dedicated venue** — e.g., a center or classroom (قاعة / سنتر).

In the database schema, this is represented by the `LessonType` enum (`at_teacher`, `at_student`, `group`, `any`).

### 1.3 Key Personas & Roles
- **Client / Learner** (`userType=parent`): Manages dependents/children, searches teachers, manages favorites, creates tutor requests, and tracks contact requests.
- **Teacher** (`userType=teacher`): Manages profile, subjects & pricing, session places/formats, views incoming contact requests, and browses local tutor requests.
- **Admin** (`userType=admin`): Manages platform entities (users, subjects, stages, requests) via the administrative panel.

---

## Section 2: Technical Architecture & Environment Setup

### 2.1 Monorepo Architecture
Zads is built as a unified repository composed of:
1. **Frontend App (`zads-app/`)**: Built on Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui, Zustand, next-intl, CASL, and Auth.js v5.
2. **Backend API (`zads-api/`)**: Built on Node.js, Express, Prisma ORM, and PostgreSQL.
3. **Legacy Projects (`legacy/`)**: Archived Vue 3/Nuxt 3 codebases kept for historical reference.

```
┌─────────────────────────────────┐
│        Web App (Next.js)        │
│    (Learner, Teacher, Admin)    │
└────────────────┬────────────────┘
                 │ (Axios API Client / NextAuth Session)
                 ▼
        ┌─────────────────┐
        │   REST (API)    │ (Express.js)
        └────────┬────────┘
                 ▼
        ┌─────────────────┐
        │   PostgreSQL    │ (Prisma ORM)
        └─────────────────┘
```

### 2.2 Local Development Setup

#### Backend API Setup
```bash
cd zads-api
pnpm install
cp .env.example .env
# Edit .env database credentials
npx prisma migrate dev
npx prisma db seed
pnpm run dev
```
API runs on `http://localhost:3000`.

#### Frontend Next.js App Setup
```bash
cd zads-app
pnpm install
cp .env.local.example .env.local
# Edit .env.local with credentials and API endpoints
pnpm run dev
```
App runs on `http://localhost:3001` (configured to explicitly prevent port conflicts with the API).

### 2.3 Production/Staging Database Migrations
For staging and production environments, migrations are run safely and non-interactively to prevent accidental data resets:
```bash
pnpm run db:migrate:prod
```
This script maps directly to `prisma migrate deploy` which applies pending migrations silently.

---

## Section 3: Codebase Structure & Directory Map

### 3.1 Frontend App Directory (`zads-app/`)
- **`src/app/`**: File-based routes inside Next.js App Router.
  - `[locale]/public/`: Visitor-facing landing, about, how-it-works pages.
  - `[locale]/auth/`: Login, register chooser, role-based registration (`client` and `teacher`).
  - `[locale]/client/client/`: Learner portal (dependents, favorites, requests, teacher profile, search).
  - `[locale]/teacher/teacher/`: Teacher portal (browse requests, manage subjects, profile).
  - `[locale]/admin/admin/`: Administrative dashboards (teachers, parents, subjects, stages, requests).
- **`src/proxy.ts`**: Edge-compatible middleware handling locale redirection and role-based route gating.
- **`src/lib/`**: Core utilities.
  - `auth.ts`: NextAuth credentials provider proxying credentials to the Express API.
  - `api.ts`: Custom Axios wrapper automatically injecting the `Authorization: Bearer <token>` header from session context.
- **`src/stores/`**: Global state management driven by Zustand stores:
  - `auth.ts`: Auth and profile updates.
  - `client.ts` / `dependents.ts` / `favorites.ts` / `tutor-requests.ts` / `contact-requests.ts`: Client/Learner states.
  - `teacher.ts` / `teacher-subjects.ts`: Teacher portfolio and pricing states.
  - `search.ts`: Core search engine, filters, and stages/subjects lists.

### 3.2 Backend API Directory (`zads-api/`)
- **`src/app.js`**: App entry point mounting routes, error handlers, and Express JSON middleware.
- **`src/routes/`**: Declares REST endpoints (e.g., `auth.routes.js`, `teachers.routes.js`, `parents.routes.js`).
- **`src/controllers/`**: Logic handlers processing requests and database updates.
- **`src/middlewares/`**:
  - `auth.js`: JWT signature extraction, validation, and role check filters (`isTeacher`, `isParent`, `isAdmin`).
  - `error.js`: Global error formatting.

---

## Section 4: Complete Feature & Route Map

| Feature Area | Next.js Page Route File | API Endpoint / Route File | Zustand Store / State |
| :--- | :--- | :--- | :--- |
| **Public Landing** | `src/app/[locale]/public/page.tsx` | N/A | N/A |
| **About Page** | `src/app/[locale]/public/about/page.tsx` | N/A | N/A |
| **How It Works** | `src/app/[locale]/public/how-it-works/page.tsx` | N/A | N/A |
| **Auth Login** | `src/app/[locale]/auth/login/page.tsx` | `POST /api/auth/login` | NextAuth Session (`src/lib/auth.ts`) |
| **Client Registry**| `src/app/[locale]/auth/register/client/page.tsx`| `POST /api/auth/register/parent` | NextAuth Session |
| **Teacher Registry**| `src/app/[locale]/auth/register/teacher/page.tsx`| `POST /api/auth/register/teacher`| NextAuth Session |
| **Client Dashboard**| `src/app/[locale]/client/client/page.tsx` | `GET /api/parents/me` | `src/stores/client.ts` |
| **Dependents Mgmt**| `src/app/[locale]/client/client/dependents/page.tsx`| `GET/POST/DELETE /api/parents/me/children` | `src/stores/dependents.ts` |
| **Teacher Search** | `src/app/[locale]/client/client/teacher/page.tsx`| `GET /api/teachers/search` | `src/stores/search.ts` |
| **Teacher Details**| `src/app/[locale]/client/client/teacher/[id]/page.tsx`| `GET /api/teachers/:id` | Custom Client Fetch |
| **Favorites** | `src/app/[locale]/client/client/favorites/page.tsx`| `GET/POST/DELETE /api/favorites` | `src/stores/favorites.ts` |
| **Tutor Requests** | `src/app/[locale]/client/client/requests/page.tsx`| `GET/POST/DELETE /api/tutor-requests` | `src/stores/tutor-requests.ts` |
| **Contact Requests**| `src/app/[locale]/client/client/requests/page.tsx`| `GET/POST /api/contact-requests` | `src/stores/contact-requests.ts` |
| **Teacher Dashboard**| `src/app/[locale]/teacher/teacher/page.tsx` | `GET /api/teachers/me/stats` | `src/stores/teacher.ts` |
| **Browse Offers** | `src/app/[locale]/teacher/teacher/browse/page.tsx`| `GET /api/tutor-requests` (Browse area) | `src/stores/tutor-requests.ts` |
| **Teacher Subjects**| `src/app/[locale]/teacher/teacher/subjects/page.tsx`| `GET/POST/PUT /api/teachers/me/subjects` | `src/stores/teacher-subjects.ts` |
| **Incoming Requests**| `src/app/[locale]/teacher/teacher/requests/page.tsx`| `GET/PATCH /api/contact-requests/incoming` | `src/stores/contact-requests.ts` |
| **Teacher Profile** | `src/app/[locale]/teacher/teacher/profile/page.tsx`| `PUT /api/teachers/me` | `src/stores/teacher.ts` |
| **Admin Overview** | `src/app/[locale]/admin/admin/page.tsx` | `GET /api/admin/dashboard` | N/A |
| **Admin Teachers** | `src/app/[locale]/admin/admin/teachers/page.tsx`| `GET/PUT/DELETE /api/admin/teachers`| Custom Admin Fetch |
| **Admin Parents** | `src/app/[locale]/admin/admin/parents/page.tsx`| `GET/PUT/DELETE /api/admin/parents` | Custom Admin Fetch |
| **Admin Subjects** | `src/app/[locale]/admin/admin/subjects/page.tsx`| `GET/POST/PUT /api/subjects` | Custom Admin Fetch |
| **Admin Stages** | `src/app/[locale]/admin/admin/stages/page.tsx` | `GET/POST/PUT /api/stages` | Custom Admin Fetch |
