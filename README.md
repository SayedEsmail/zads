# Zads (زاد)

**زاد** is a local learning community that connects anyone who wants to learn—students, professionals, or parents—with teachers and trainers in the same city and area. It is built on **«الجيرة التعليمية»**: strong local discovery, flexible **where** the lesson happens (online, at the learner’s home, at the teacher’s home, or at a dedicated venue), and tools for **clients** (self or family) and **teachers** to find each other.

**Domain:** [zads.app](https://zads.app)

For the full product story and how it maps to code, read **[DOCUMENTATION.md](./DOCUMENTATION.md)**.

---

## Development strategy

> **Phase 1 (current):** Web-first for faster adoption.  
> The **mobile app** is not maintained in this repository.

---

## Projects

| Project | Description | Tech stack | Status |
|---------|-------------|------------|--------|
| [zads_web](./zads_web/) | Web app (clients + teachers) | Nuxt 3, Vuetify 3, Pinia | Active |
| [zads-api](./zads-api/) | Backend API | Node.js, Express, Prisma, PostgreSQL | Active |
| [zads-dashboard](./zads-dashboard/) | Admin dashboard | Vue 3, Vuetify 3, Vite | Active |

---

## Quick start

### 1. Start the API

```bash
cd zads-api
npm install
cp .env.example .env
# Edit .env with your database credentials
npx prisma migrate dev
npx prisma db seed
npm run dev
```

API: `http://localhost:3000`

### 2. Start the web app (primary)

```bash
cd zads_web
pnpm install
cp .env.example .env
pnpm dev
```

Web: see `zads_web/nuxt.config.ts` for `devServer.port` (often `4000`; old docs may say `3001`).

### 3. Start the dashboard

```bash
cd zads-dashboard
pnpm install
cp .env.example .env
pnpm dev
```

Dashboard: `http://localhost:5173`

---

## Documentation

- [DOCUMENTATION.md](./DOCUMENTATION.md) — Product + platform (canonical)
- [TECH_PLAN.md](./TECH_PLAN.md) — Unified technical plan
- [CODEBASE_OVERVIEW.md](./CODEBASE_OVERVIEW.md) — Repo / architecture map
- [FEATURES_OVERVIEW.md](./FEATURES_OVERVIEW.md) — Features vs routes, stores, API

**Planned work:** a single **Next.js + TypeScript** app to replace `zads_web` + `zads-dashboard` is described in the Cursor plan `react_migration_tasks_add84281.plan.md` (under your `.cursor/plans` folder, if present).

---

## Default credentials (after seed)

- **Admin phone:** 01000000000  
- **Admin password:** admin123  

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Web (Nuxt)     │     │  Dashboard (Vue) │
│   ⭐ active       │     │  ⭐ active        │
└────────┬────────┘     └────────┬────────┘
         │                      │
         └──────────┬───────────┘
                    ▼
            ┌───────────────┐
            │  REST (API)  │
            └───────┬──────┘
                    ▼
            ┌───────────────┐
            │  PostgreSQL  │
            └──────────────┘
```

---

## License

Private — all rights reserved.
