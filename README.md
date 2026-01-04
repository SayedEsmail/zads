# Zads (زاد)

Educational marketplace platform connecting parents with private tutors in Egypt.

**Domain:** [zads.app](https://zads.app)

---

## Projects

| Project | Description | Tech Stack |
|---------|-------------|------------|
| [zads-api](./zads-api/) | Backend API | Node.js, Express, Prisma, PostgreSQL |
| [zads-dashboard](./zads-dashboard/) | Admin Dashboard | Vue 3, Vuetify 3, Vite |
| [zads_app](./zads_app/) | Mobile App | Flutter, Riverpod, Dio |

---

## Quick Start

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

### 2. Start the Dashboard

```bash
cd zads-dashboard
pnpm install
cp .env.example .env
pnpm dev
```

Dashboard: `http://localhost:5173`

### 3. Run the Mobile App

```bash
cd zads_app
flutter pub get
flutter run
```

---

## Documentation

- [PRD.md](./PRD.md) - Product Requirements Document
- [zads-api/TECH_PLAN.md](./zads-api/TECH_PLAN.md) - API Technical Plan
- [zads-dashboard/TECH_PLAN.md](./zads-dashboard/TECH_PLAN.md) - Dashboard Technical Plan
- [zads_app/TECH_PLAN.md](./zads_app/TECH_PLAN.md) - Mobile App Technical Plan

---

## Default Credentials

After seeding the database:
- **Admin Phone:** 01000000000
- **Admin Password:** admin123

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │     │    Dashboard    │
│   (Flutter)     │     │    (Vue 3)      │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │   REST API  │
              │  (Express)  │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │  PostgreSQL │
              └─────────────┘
```

---

## License

Private - All rights reserved.
