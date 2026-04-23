# Zads (زاد)

Educational marketplace platform connecting parents with private tutors in Egypt.

**Domain:** [zads.app](https://zads.app)

---

## 📱 Development Strategy

> **Phase 1 (Current):** Web-first approach for faster user acquisition.
> Mobile app development is **paused** until web platform gains traction.

---

## Projects

| Project | Description | Tech Stack | Status |
|---------|-------------|------------|--------|
| [zads_web](./zads_web/) | Web App (Parents & Teachers) | Nuxt 3, Vuetify 3, Pinia | ⭐ **Active** |
| [zads-api](./zads-api/) | Backend API | Node.js, Express, Prisma, PostgreSQL | ⭐ **Active** |
| [zads-dashboard](./zads-dashboard/) | Admin Dashboard | Vue 3, Vuetify 3, Vite | ⭐ **Active** |
| [zads_app](./zads_app/) | Mobile App | Flutter, Riverpod, Dio | ⏸️ **Paused** |

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

### 2. Start the Web App (Primary)

```bash
cd zads_web
pnpm install
cp .env.example .env
pnpm dev
```

Web App: `http://localhost:3001`

### 3. Start the Dashboard

```bash
cd zads-dashboard
pnpm install
cp .env.example .env
pnpm dev
```

Dashboard: `http://localhost:5173`

### 4. (Optional) Run the Mobile App
> ⏸️ Mobile development is paused for Phase 1
```bash
cd zads_app
flutter pub get
flutter run
```

---

## Documentation

- [DOCUMENTATION.md](./DOCUMENTATION.md) - Unified product + platform documentation (canonical)
- [TECH_PLAN.md](./TECH_PLAN.md) - Unified technical plan (canonical)
- [CODEBASE_OVERVIEW.md](./CODEBASE_OVERVIEW.md) - Repo/architecture map
- [FEATURES_OVERVIEW.md](./FEATURES_OVERVIEW.md) - Feature map (routes/stores/endpoints)

---

## Default Credentials

After seeding the database:
- **Admin Phone:** 01000000000
- **Admin Password:** admin123

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Web App      │     │    Dashboard    │     │   Mobile App    │
│   (Nuxt 3)      │     │    (Vue 3)      │     │   (Flutter)     │
│   ⭐ ACTIVE     │     │   ⭐ ACTIVE     │     │   ⏸️ PAUSED      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
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
