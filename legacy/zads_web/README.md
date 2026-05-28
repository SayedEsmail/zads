# Zads Web ⭐ ACTIVE

> **Primary Focus for Phase 1** - Web-first approach for faster parent & teacher acquisition.

Web application for the Zads educational marketplace platform.

## Tech Stack

- Nuxt 3
- Vuetify 3
- **Vuexy Admin Template v10.4.0** (Pre-made components & UI)
- Pinia (State Management)
- @sidebase/nuxt-auth (Authentication)
- @nuxtjs/i18n (Internationalization)
- ofetch (HTTP Client)

## Prerequisites

- Node.js 18+
- pnpm (recommended)
- Running Zads API

## Setup

1. **Install dependencies:**
```bash
cd zads_web
pnpm install
```

2. **Configure environment:**
```bash
cp .env.example .env
```

Edit `.env`:
```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

## Running Locally

```bash
# Development mode
pnpm dev
```

Web App will be available at: `http://localhost:3001`

> **Note:** Make sure the API (`zads-api`) is running first!

## Project Structure

```
zads_web/
├── @core/              # Core components & utilities
├── @layouts/           # Layout system
├── assets/             # Styles, images
├── components/         # Reusable Vue components
├── composables/        # Vue composables
├── layouts/            # Page layouts
├── middleware/         # Route middleware
├── pages/              # File-based routing
├── plugins/            # Nuxt plugins
├── server/             # API routes (if needed)
├── stores/             # Pinia stores
├── utils/              # Utility functions
├── nuxt.config.ts      # Nuxt configuration
└── app.vue             # Root component
```

## Features to Implement

### Public Pages
- 🏠 Landing Page
- ℹ️ About Us
- 📖 How It Works

### Authentication
- 🔐 Login
- 📝 Register (Parent/Teacher)
- 🔑 Forgot Password

### Parent Features
- 🔍 Search teachers
- 👤 View teacher profiles
- 👶 Manage children
- 📨 Send contact requests
- ❤️ Favorites

### Teacher Features
- 📊 Dashboard with stats
- ✏️ Edit profile
- 💰 Manage subjects & pricing
- 📥 View incoming requests

## Scripts

```bash
pnpm dev       # Start development server
pnpm build     # Build for production
pnpm generate  # Generate static site
pnpm preview   # Preview production build
```

## Language

The app is fully in **Arabic (RTL)**.

---

See root docs:

- `../TECH_PLAN.md` (unified technical plan)
- `../DOCUMENTATION.md` (unified product/platform docs)
- `../CODEBASE_OVERVIEW.md`
- `../FEATURES_OVERVIEW.md`
