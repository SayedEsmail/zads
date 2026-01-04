# Zads Dashboard

Admin dashboard for the Zads educational marketplace platform.

## Tech Stack

- Vue 3 (Composition API)
- Vuetify 3
- Vite
- Pinia (State Management)
- Axios

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

## Setup

1. **Install dependencies:**
```bash
cd zads-dashboard
pnpm install
```

2. **Configure environment:**
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Running Locally

```bash
# Development mode
pnpm dev
```

Dashboard will be available at: `http://localhost:5173`

> **Note:** Make sure the API (`zads-api`) is running first!

## Login

Use the admin credentials from the API:
- **Phone:** 01000000000
- **Password:** admin123

## Features

- 📊 Dashboard with platform statistics
- 👨‍🏫 Teachers management (list, suspend, activate)
- 👨‍👩‍👧 Parents management
- 📚 Subjects CRUD
- 🎓 Stages CRUD
- 📨 Contact requests view

## Scripts

```bash
pnpm dev       # Start development server
pnpm build     # Build for production
pnpm preview   # Preview production build
```

## Language

The dashboard is fully in **Arabic (RTL)**.
