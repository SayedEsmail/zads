# Zads (زاد)

**زاد** is a local learning community that connects anyone who wants to learn—students, professionals, or parents—with teachers and trainers in the same city and area. It is built on **«الجيرة التعليمية»**: strong local discovery, flexible **where** the lesson happens (online, at the learner’s home, at the teacher’s home, or at a dedicated venue), and tools for **clients** (self or family) and **teachers** to find each other.

**Domain:** [zads.app](https://zads.app)

For the full product story and how it maps to code, read **[DOCUMENTATION.md](./DOCUMENTATION.md)**.

---

## Development Strategy

The codebase is structured as a unified monorepo containing the active frontend application and the backend API.

---

## Projects

| Project | Description | Tech Stack | Status |
|---------|-------------|------------|--------|
| [zads-app](./zads-app/) | Unified Web App (Clients, Teachers, and Admin) | Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui, Zustand, next-intl | Active |
| [zads-api](./zads-api/) | Backend API | Node.js, Express, Prisma, PostgreSQL | Active |
| [legacy/](./legacy/) | Legacy Vue 3 / Nuxt 3 project components | Vue 3, Nuxt 3, Vuetify 3 | Deprecated |

---

## Quick Start

### 1. Start the API

```bash
cd zads-api
pnpm install
cp .env.example .env
# Edit .env with your database credentials
npx prisma migrate dev
npx prisma db seed
pnpm run dev
```

API will be available at: `http://localhost:3000` (base: `http://localhost:3000/api`)

### 2. Start the Web App (Unified Portal)

```bash
cd zads-app
pnpm install
cp .env.local.example .env.local
# Edit .env.local with NEXTAUTH_SECRET and API_BASE_URL if needed
pnpm run dev
```

Web App will be available at: `http://localhost:3001` (redirects automatically to `http://localhost:3001/ar` or `/en`)

---

## Documentation

- [DOCUMENTATION.md](./DOCUMENTATION.md) — Product + platform (canonical)
- [TECH_PLAN.md](./TECH_PLAN.md) — Unified technical plan
- [CODEBASE_OVERVIEW.md](./CODEBASE_OVERVIEW.md) — Repo / architecture map
- [FEATURES_OVERVIEW.md](./FEATURES_OVERVIEW.md) — Features vs routes, stores, API

---

## Default Credentials (After Seed)

- **Admin Phone:** `01000000000`  
  **Password:** `admin123`  

- **Teacher Phone:** `01111111111`  
  **Password:** `teacher123`  

- **Parent Phone:** `01222222222`  
  **Password:** `parent123`  

---

## Architecture

```
┌─────────────────────────────────┐
│        Web App (Next.js)        │
│    (Learner, Teacher, Admin)    │
└────────────────┬────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   REST (API)    │
        └────────┬────────┘
                 ▼
        ┌─────────────────┐
        │   PostgreSQL    │
        └─────────────────┘
```

---

## License

Private — all rights reserved.
