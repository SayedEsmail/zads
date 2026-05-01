# zads-app

Next.js 16 + TypeScript single app — consolidates `zads_web` (learner/client web) and `zads-dashboard` (admin) into one deployment.

## Stack

| Concern | Library |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, `src/`) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| State | Zustand |
| HTTP | Axios (calls `zads-api` directly) |
| Auth | Auth.js v5 (credentials proxy → zads-api JWT) |
| i18n | next-intl (`en` default LTR, `ar` RTL) |
| Authorization | @casl/ability + @casl/react (client-side UI gating only) |
| Tables | @tanstack/react-table (Admin DataTable) |
| Forms | react-hook-form + zod |

## Routes

```
/[locale]/                    → Landing (public)
/[locale]/login               → Login
/[locale]/register            → Role chooser
/[locale]/register/client     → Client registration (w/ clientAccountKind)
/[locale]/register/teacher    → Teacher registration
/[locale]/forgot-password     → Forgot password

/[locale]/client/*            → Client / Learner area (requires userType=parent)
/[locale]/teacher/*           → Teacher area (requires userType=TEACHER)
/[locale]/admin/*             → Admin dashboard (requires userType=ADMIN)
```

## Locales

- `en` → LTR (default)
- `ar` → RTL
- `dir` is set dynamically on `<html>` from the locale segment

## Setup

```bash
cp .env.local.example .env.local  # Fill NEXTAUTH_SECRET and API_BASE_URL
npm install
npm run dev
```

Open http://localhost:3000 → redirects to /en

## API

Points to `zads-api` at `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:3001/api`).
Auth flow: NextAuth credentials provider calls `/api/auth/login`, wraps JWT in session cookie.

## P0-13 RTL Test

Visit `/en/test-rtl` or `/ar/test-rtl` to validate LTR/RTL rendering. Delete this page before production.
