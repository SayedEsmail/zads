---
name: React migration tasks
overview: Full task breakdown for migrating zads_web and zads-dashboard into a single Next.js + TypeScript app, after zads-api platform updates (Client/Learner, Dependents, requestTarget, studyMode, online/offline teacher pricing). Wireframes first, then implementation.
todos:
  - id: platform-evolution
    content: "Platform: Client/Learner personas, Dependents, Prisma+API (requestTarget, studyMode, accountKind, teacher online/offline pricing) — PE-1 through PE-6; must land before or alongside zads-app client work"
    status: completed
  - id: wireframes
    content: "Wireframes: 13 key pages (W-1 through W-13) with Client/Dependents/studyMode wireframe notes"
    status: completed
  - id: phase-0
    content: "Phase 0: Foundation -- scaffold, deps, Tailwind+RTL, shadcn, Zustand conventions, NextAuth (credentials proxy), next-intl, CASL (client-only), Edge middleware, layouts, shared types (14 tasks: P0-1 through P0-14)"
    status: completed
  - id: phase-1
    content: "Phase 1: Auth -- auth store + login, register (client+teacher) with clientAccountKind, forgot-password (6 tasks: P1-1 through P1-6)"
    status: completed
  - id: phase-2
    content: "Phase 2: Public -- landing, about, how-it-works, navbar+footer (4 tasks: P2-1 through P2-4)"
    status: completed
  - id: phase-3
    content: "Phase 3: Client / Learner area (route group /client/*) -- 6 stores, 5 shared components, dashboard, 7 pages; labels + fields for accountKind, dependents, requestTarget, studyMode (18 tasks: P3-1 through P3-18)"
    status: completed
  - id: phase-4
    content: "Phase 4: Teacher area -- 2 stores, 6 pages (8 tasks: P4-1 through P4-8)"
    status: completed
  - id: phase-5
    content: "Phase 5: Admin dashboard -- DataTable (TanStack), 8 admin pages (9 tasks: P5-1 through P5-9)"
    status: completed
  - id: phase-6
    content: "Phase 6: Polish -- i18n, responsive, API verification, docs update, URL redirects, remove old apps (6 tasks: P6-1 through P6-6)"
    status: completed
isProject: false
---

# React Migration -- Complete Task Breakdown

## Canonical product story (must stay aligned with repo docs)

This engineering plan must remain consistent with **`DOCUMENTATION.md`**, **`README.md`**, **`FEATURES_OVERVIEW.md`**, **`CODEBASE_OVERVIEW.md`**, and **`TECH_PLAN.md`**.

**What Zads is (non-technical):** Zads (**زاد**) is a **local learning community** that connects anyone who wants to learn—student, professional, or parent—with teachers and trainers in the **same city and area**. The positioning is **«الجيرة التعليمية»** (neighborhood learning): knowledge stays geographically close and easy to reach.

**Where lessons happen (four product options):** (1) **Online** — over the internet. (2) **At the learner’s home** — teacher travels to the client. (3) **At the teacher’s home** — client goes to the teacher. (4) **Dedicated venue** — e.g. center or classroom. In the **current** API, place/format is partly modeled via **`LessonType`** (`at_teacher`, `at_student`, `group`, `any` in Prisma); **online vs offline** and per-mode pricing are extended in **Platform evolution** below and in PE-5 (relationship to legacy fields).

**Client benefits:** instant local discovery; one account for **your own** learning and/or **dependents**; **tutor requests** visible to nearby teachers; **favorites**.  
**Teacher benefits:** local visibility; **tutor requests** as opportunities; control of subjects, prices, and formats; profile/stats insight.

When product copy or docs change, update this section and **PE-4** (documentation pass).

## Workflow

1. **Wireframes** (text description + generated image for 13 key pages)
2. **Create tasks** (this document -- granular sub-tasks per phase)
3. **Plan each task** (expand details before coding)
4. **Implement task by task**

---

## Platform evolution (product + database + API)

The marketplace is no longer "parents only". **Clients / Learners** are anyone who needs a teacher for themselves or for one of their Dependents (تابعون). They can book **offline, online, or both**, depending on what the teacher offers and what the request specifies.

### Personas (updated)

- **Client / Learner** (replaces the sole "parent" product label): a user with `userType` from the API that today is still `parent` in [zads-api/prisma/schema.prisma](zads-api/prisma/schema.prisma) (keep enum value for JWT backward compatibility; treat it as the "client" role in the app).
- **Client account kind** (new field on the client profile, not a new `UserType`):
  - `student` = **فردي** (books only for self; Dependents management is optional or empty by default)
  - `guardian` = **ولي أمر** (can add Dependents and book for them; may also book for self where flows allow)
- **Dependents** (product name for "children"): same underlying `ParentChild` / `parent_children` table; UI and copy use "dependents" / "تابعون". No requirement to rename the DB table in v1 (optional later migration to `dependents` with `@@map`).
- **Teacher** and **Admin** unchanged at the top level.

### Database / Prisma (zads-api) -- required changes

Reference: current models in [zads-api/prisma/schema.prisma](zads-api/prisma/schema.prisma).

1. **User vs Parent for "فردي / ولي أمر"**
   - Product asks for a field on the **user** conceptually. In Prisma, the clean place is the **`Parent` row (1:1 with `User` when `userType` is `parent`)**: add `clientAccountKind` there, so we do not denormalize onto `User` while `teacher`/`admin` have no use for it. If you prefer a column on `users`, add the same enum there for `userType=parent` only (nullable for others) -- choose one in PE-1.

2. **Parent model (client profile)**
   - Add enum e.g. `ClientAccountKind { student guardian }` (or `self_only` / `guardian` -- pick one naming in implementation).
   - Add field: `clientAccountKind ClientAccountKind` on `Parent` (default: align with product default, e.g. `guardian` for existing rows to avoid breaking current users who have children, or backfill from "has any ParentChild" → `guardian`, else `student`).

3. **TutorRequest model**
   - Add `requestTarget` enum: `self` | `dependent` (Self / Child in product copy).
   - Add `studyMode` enum: `online` | `offline` | `both`.
   - Backfill: if `parentChildId` is null, set `requestTarget = self`; if set, `requestTarget = dependent`. Existing `preferredLessonType` (LessonType: at_teacher, at_student, etc.) **stays** for now; document how it relates to `studyMode` (physical place vs online/offline) -- may consolidate in a later cleanup.

4. **TeacherSubject model** (finer online vs offline pricing)
   - Today: `priceAtTeacher`, `priceAtStudent`, `priceGroup` (in-person semantics).
   - Add explicit fields for online vs offline hourly (or per session) pricing, e.g. `priceOnline` and `priceOffline` (Int, EGP or smallest currency unit, same as existing price columns), with validation in API.
   - Migration: backfill from existing prices where possible (e.g. copy `priceAtStudent` → both, or one column per product rule decided at implementation time).

5. **API layer (Express + Zod)**
   - Update create/update DTOs for TutorRequest, register/profile for client `clientAccountKind`, and TeacherSubject pricing.
   - Controllers: [zads-api/src/controllers/parents.controller.js](zads-api/src/controllers/parents.controller.js) (auto tutor requests on add child) must set `requestTarget` / `studyMode` with sensible defaults.

### zads-app (Next.js) implications

- **Routes**: new app uses `/client/*` (or `/(client)/` route group) as the primary prefix for the former parent area. Keep **permanent redirect** from `/parent/*` → `/client/*` (P6-6) for bookmarks and old links. Middleware in P0-9 checks the same `userType === 'parent'` token claim until the API renames the enum (optional future).
- **i18n**: all user-facing strings "parent" → "client" / "learner" where appropriate; "children" → "dependents" / "تابعون".
- **Forms**: registration for the client role collects `clientAccountKind`. Tutor request and contact flows expose `requestTarget` (self vs dependent picker) and `studyMode` (filter + form fields). Teacher subjects UI edits `priceOnline` / `priceOffline` in addition to legacy in-person fields until consolidated.
- **Types** (P0-14): extend shared types with `ClientAccountKind`, `RequestTarget`, `StudyMode`, and updated `TutorRequest` / `TeacherSubject` shapes.

### Platform evolution tasks (in zads-api + docs; do before or in parallel with client UI)

- **PE-1**: Prisma schema + migration for `ClientAccountKind`, `requestTarget`, `studyMode`, and TeacherSubject online/offline prices; data backfill scripts
- **PE-2**: Zod + controllers + routes for new fields (tutor request create/update, parent profile patch, teacher subject create/update)
- **PE-3**: Seed and admin dashboard columns for new fields (admin list/detail filters where relevant)
- **PE-4**: `DOCUMENTATION.md` + `FEATURES_OVERVIEW.md` + this plan: personas and field glossary (Arabic + English)
- **PE-5**: Reconcile `LessonType` (at_teacher / at_student) vs `studyMode` in one short doc in repo (deprecation or coexistence)
- **PE-6**: E2E smoke: create client (student + guardian), create tutor request with self vs dependent, verify teacher search filters by study mode if API supports it

---

## Wireframes -- Key pages (13 wireframes)

The design approach is **mobile-first**. Each wireframe shows the mobile layout as the primary view, with notes on how sections reflow/expand for tablet and desktop breakpoints. Every generated wireframe image depicts the mobile viewport (375px width). Pages that follow an already-wireframed pattern (e.g., teacher settings follows the same layout as parent settings) are skipped.

### W-1: Login page
- **Pattern**: Auth form (also represents forgot-password)
- **Layout**: Full-screen centered card on blank background, RTL
- **Mobile**: Card fills full width with padding, stacked inputs, full-width button
- **Desktop**: Card constrained to ~400px centered, optional side illustration
- **Sections**: Logo, phone input, password input, "forgot password" link, submit button, "register" link
- **Source**: [zads_web/pages/login.vue](zads_web/pages/login.vue)

### W-2: Register choice page
- **Pattern**: Selection cards
- **Mobile**: Cards stacked vertically, full width
- **Desktop**: Two cards side-by-side, centered
- **Sections**: Heading, two role cards -- **Client / Learner** (يلي بيدور على درس) vs **Teacher** (معلم)
- **Source**: [zads_web/pages/register/index.vue](zads_web/pages/register/index.vue)

### W-3: Register form page (client / learner)
- **Pattern**: Auth form with more fields (also represents teacher register)
- **Mobile**: Full-width card, stacked fields, full-width button
- **Desktop**: Card constrained to ~450px centered
- **Sections**: Name, phone, password, confirm password, **account kind** (فردي / ولي أمر), submit, "already have account" link
- **Source**: [zads_web/pages/register/parent.vue](zads_web/pages/register/parent.vue) (API userType remains `parent` until changed)

### W-4: Landing page (public)
- **Pattern**: Marketing page
- **Mobile**: Single-column stacked sections, hamburger nav, hero image above text
- **Desktop**: Multi-column feature grids (2-3 cols), hero with side-by-side text + image, full navbar
- **Sections**: Hero banner with CTA, features grid, how-it-works steps, testimonials/stats, final CTA
- **Source**: [zads_web/pages/index.vue](zads_web/pages/index.vue)

### W-5: Client / Learner dashboard
- **Pattern**: Dashboard with stats + cards + search
- **Mobile**: No sidebar -- bottom tab bar or hamburger menu, stats in scrollable horizontal row, content stacked vertically
- **Desktop**: Sidebar nav on right (RTL) + top header + content area, stats in a row, two-column layout for requests
- **Sections**: Welcome banner / hero, stat widgets row (**dependents** count if guardian, active requests, favorites), teacher search bar + filters (include **study mode** where API supports), recent tutor requests (show **self vs dependent**), recent contact requests
- **Source**: [zads_web/pages/parent/index.vue](zads_web/pages/parent/index.vue) (target route: `/client` in new app)

### W-6: Dependents management (تابعون)
- **Pattern**: CRUD list with add/edit dialog (guarding accounts; optional for فردي)
- **Mobile**: Dependents as stacked cards (full width), floating "+" button, dialog as full-screen sheet sliding from bottom
- **Desktop**: Dashboard layout, cards in grid (2-3 cols), dialog as centered modal
- **Sections**: Page header + "add dependent" button, cards (name, stage, subjects), edit/delete, add/edit dialog (name, stage, subjects) -- same data model as `ParentChild`
- **Source**: [zads_web/pages/parent/children.vue](zads_web/pages/parent/children.vue) (target route: `/client/dependents` or keep `/client/children` with copy change)

### W-7: Teacher search results (client index with search)
- **Pattern**: Search + filter + card grid
- **Mobile**: Search bar on top, filter as collapsible sheet (slide-up), results as single-column card list, infinite scroll or "load more" button
- **Desktop**: Search bar + filter sidebar on right (RTL), results as 2-3 column card grid, pagination bar
- **Sections**: Search bar (by name/subject), filters (subject, stage, location, **study mode: online / offline / both** when API exposes), lesson location type if still used, TeacherCard results grid, pagination
- **Source**: [zads_web/pages/parent/index.vue](zads_web/pages/parent/index.vue) (search section)

### W-8: Teacher profile detail page
- **Pattern**: Detail view with actions
- **Mobile**: Stacked single-column, avatar + name header, sticky bottom bar with contact + favorite buttons, subjects as horizontal scrollable chips
- **Desktop**: Two-column layout (profile info left, subjects/pricing table right in RTL context), action buttons in header area
- **Sections**: Teacher header (avatar, name, rating, location), bio section, **subjects + pricing: show online vs offline (and legacy in-person) per row**, lesson types, qualifications, contact button (opens ContactRequestDialog; request may set study mode), favorite toggle
- **Source**: [zads_web/pages/parent/teacher/[id].vue](zads_web/pages/parent/teacher/[id].vue)

### W-9: Client requests page (tabbed list)
- **Pattern**: Tabbed list view
- **Mobile**: Tabs as full-width segmented control at top, cards stacked full-width, swipeable between tabs
- **Desktop**: Tabs as standard tab bar, cards in single column with more horizontal detail
- **Sections**: Two tabs (tutor requests, contact requests), tutor requests: TutorRequestCards show **request target (self / dependent)** and **study mode** badges, status + close/delete, contact tab unchanged
- **Source**: [zads_web/pages/parent/requests/index.vue](zads_web/pages/parent/requests/index.vue)

### W-10: Teacher dashboard
- **Pattern**: Dashboard variant (different stats + incoming focus)
- **Mobile**: Bottom tab bar, stats as horizontal scrollable cards, incoming requests and opportunities stacked
- **Desktop**: Sidebar nav (different items than client area), stats row, two-column layout (incoming requests | opportunities)
- **Sections**: Stats row (profile views, contacts received, rating, active subjects), incoming contact requests list (recent, with accept/reject), nearby tutor requests list (opportunities)
- **Source**: [zads_web/pages/teacher/index.vue](zads_web/pages/teacher/index.vue)

### W-11: Teacher subjects + pricing page
- **Pattern**: Editable table/list
- **Mobile**: Subjects as stacked cards (each showing subject, stage, price, lesson type), floating "+" button, add/edit as bottom sheet
- **Desktop**: Subjects as editable table with inline actions, "add subject" button in header, add/edit as centered dialog
- **Sections**: Page header + "add subject" button, subjects table/cards with **separate online vs offline** pricing fields (plus existing in-person group/at-teacher if still used), add/edit dialog: subject, stage, lesson type, **priceOnline**, **priceOffline**, group price if applicable
- **Source**: [zads_web/pages/teacher/subjects.vue](zads_web/pages/teacher/subjects.vue)

### W-12: Admin dashboard stats page
- **Pattern**: Admin overview
- **Mobile**: Hamburger menu (no sidebar), stats as 2x2 grid cards, activity feed below
- **Desktop**: Admin layout (vertical sidebar nav on right in RTL + header + content), stats in a row, charts/activity in two columns
- **Sections**: Stats cards row (total teachers, **clients (legacy "parents" in API)**, total requests, active subjects), recent activity feed or charts
- **Source**: [zads-dashboard/src/pages/index.vue](zads-dashboard/src/pages/index.vue)

### W-13: Admin CRUD table page (teachers)
- **Pattern**: DataTable CRUD (represents all admin entity pages: **clients (parents)**, subjects, stages, requests)
- **Mobile**: Search bar on top, data as stacked cards (not table -- tables are unusable on mobile), each card shows key fields + action menu, pagination as "load more"
- **Desktop**: Admin layout, full DataTable with sortable columns, search + filters bar, pagination bar, row action buttons
- **Sections**: Page header + action button, search bar + filters, DataTable/cards (name, phone, status, subjects count, actions), row actions (view detail, edit, toggle status), pagination
- **Source**: [zads-dashboard/src/pages/teachers.vue](zads-dashboard/src/pages/teachers.vue)

### Pages that reuse a wireframed pattern (no separate wireframe needed)

- **Forgot password**: same as W-1 (auth form) with email field instead of phone+password
- **Register teacher**: same as W-3 (auth form) with additional fields
- **About / How it works**: same as W-4 (public marketing) with different content sections
- **Favorites page**: same as W-7 (card grid) without the search/filter bar
- **Client profile / settings**: form layout similar to W-3, inside dashboard layout from W-5; includes `clientAccountKind` where editable
- **Teacher profile / settings**: form layout similar to W-3, inside dashboard layout from W-10
- **Teacher browse requests**: same as W-7 (search + filter + card grid) with TutorRequestCards
- **Teacher requests**: same as W-9 (tabbed list) with accept/reject actions
- **Admin parents / subjects / stages / requests pages**: same as W-13 (DataTable CRUD) with different columns

---

## Inventory being migrated

- **zads_web**: 21 pages, 9 Pinia stores, 33 components (16 are unused Vuexy template dialogs), 12 layouts, 3 composables, 1 middleware, 13 plugins
- **zads-dashboard**: 9 pages, 1 Pinia store, 5 components, 9 layouts, 12 plugins
- **Shared patterns**: both apps use Vuexy template, Vuetify 3, CASL, and call `zads-api` REST endpoints

## Target stack (agreed)

- Next.js 15 (App Router, TypeScript, `src/` directory)
- Tailwind CSS 4 + shadcn/ui (replaces Vuetify + Vuexy)
- Zustand (replaces Pinia)
- Axios (keep existing pattern, client calls zads-api directly)
- @casl/ability + @casl/react (client-side UI gating only -- NOT in Edge middleware)
- next-intl (replaces @nuxtjs/i18n)
- next-auth / Auth.js v5 credentials provider (proxies to zads-api, wraps API JWT in NextAuth session)
- @tanstack/react-table (admin DataTable + any tabular UI)
- All in one app: **client (learner)** + teacher + admin under route groups (`/client/*`, `/teacher/*`, `/admin/*`)

## Architectural decisions (locked)

**AUTH**: NextAuth credentials provider. The `authorize()` callback calls `POST /api/auth/login` on zads-api, receives `{ token, user }`, and stores both inside the NextAuth JWT session token. The Axios client reads the API JWT from the NextAuth session (via `getSession()` client-side or `getServerSession()` server-side) and attaches it as `Authorization: Bearer <jwt>`. This means NextAuth owns the session lifecycle (cookie, expiry, refresh) while zads-api remains the source of truth for user data. Register flows call zads-api directly, then call `signIn("credentials")` to establish the session.

**UPLOAD**: Client calls `POST /api/upload/image` on zads-api directly through the Axios instance (same as current). No Next.js proxy needed. The Axios interceptor attaches the auth header automatically.

**MIDDLEWARE (Edge)**: Next.js middleware runs on the Edge runtime, which has limited API surface. CASL will NOT run in middleware. Instead, middleware does a simple JWT decode (NextAuth's `getToken()`) to extract `userType` and enforces route-level access:
- Public routes: no check
- `/login`, `/register/*`, `/forgot-password`: redirect to role home if already authenticated
- `/client/*` (and legacy `/parent/*` if still routed): require API claim `userType === 'parent'` (JWT keeps enum name until API renames to `client`)
- `/teacher/*`: require `userType === 'TEACHER'`
- `/admin/*`: require `userType === 'ADMIN'`
- CASL is reserved for client-side component-level gating (show/hide UI elements based on abilities)

**RTL**: Arabic is the default locale. RTL is a Phase 0 concern, not Phase 6. Tailwind's `rtl:` variant and the `dir="rtl"` attribute on `<html>` will be configured in P0-3 and validated with a throwaway page in P0-13 before any real page is built. Every page built in Phases 1-5 must render correctly in RTL as it is built -- no RTL debt.

**LOADING/ERROR PATTERN**: All Zustand stores follow a consistent shape (defined in P0-12). Every store slice that fetches data exposes `{ data, isLoading, error, fetch() }`. Pages use these to render loading skeletons (shadcn Skeleton) and error banners (ErrorBanner component). This convention is locked before any store is written.

---

## Phase 0 -- Foundation and scaffold

### P0-1: Create Next.js project
- Run `create-next-app` with App Router, TypeScript, Tailwind, `src/` dir
- New folder: `zads-app/` at repo root
- Add to root README

### P0-2: Install and configure shadcn/ui
- Run `npx shadcn@latest init`
- Install base components: Button, Card, Input, Select, Dialog, Sheet, Table, Tabs, Badge, Avatar, DropdownMenu, Separator, Skeleton, Toast, Form

### P0-3: Set up Tailwind design tokens + RTL foundation
- Port colors from [zads_web/plugins/vuetify/theme.js](zads_web/plugins/vuetify/theme.js): primary `#06358d`, secondary `#f68023`, etc.
- Configure RTL as default: `dir="rtl"` on root `<html>`, Tailwind `rtl:` variant utilities
- Add IBM Plex Sans Arabic font (via `next/font/google`)
- Create `globals.css` with Tailwind directives + RTL base rules + logical properties (`ms-*`/`me-*` instead of `ml-*`/`mr-*`)
- Validate: Tailwind's RTL support works with shadcn/ui components (some may need `[dir="rtl"]` overrides)

### P0-4: Set up Zustand
- Install `zustand` + `zustand/middleware` (devtools, persist if needed)
- Create store directory `src/stores/`
- NOTE: the actual store shape convention is defined in P0-12 (must complete P0-12 before writing any real store)

### P0-5: Set up Axios API client
- Create `src/lib/api.ts` mirroring [zads_web/services/api.js](zads_web/services/api.js)
- Axios instance with `baseURL` from env var (`NEXT_PUBLIC_API_BASE_URL`)
- Request interceptor: read JWT from NextAuth session (`getSession()`) and attach `Authorization: Bearer <jwt>` header
- Response interceptor: on 401, call `signOut()` and redirect to `/login`
- Export typed helper: `api.get<T>()`, `api.post<T>()`, etc.
- Note: this is the same Axios instance used for direct uploads (`POST /api/upload/image` with `multipart/form-data`)

### P0-6: Set up NextAuth (Auth.js v5) -- credentials proxy to zads-api
- Install `next-auth@beta` (Auth.js v5)
- Create `src/lib/auth.ts`:
  - `CredentialsProvider` whose `authorize()` calls `POST ${API_BASE_URL}/auth/login` with `{ phone, password }`
  - On success, receives `{ token, user }` from zads-api
  - Returns a NextAuth user object that includes `apiToken` (the zads-api JWT), `userType`, `id`, `name`, `phone`
  - JWT callback: store `apiToken` + `userType` in the NextAuth JWT
  - Session callback: expose `apiToken` + `userType` + user fields in the session object
- Create `src/app/api/auth/[...nextauth]/route.ts` (standard NextAuth route handler)
- Create `SessionProvider` wrapper in root layout
- Define TypeScript augmentation for `next-auth` module (extend `Session`, `JWT`, `User` types with `apiToken`, `userType`)
- Register flows (client/teacher) will call zads-api directly, then call `signIn("credentials", { phone, password })` to establish session. Client register sends `clientAccountKind` when API ready.

### P0-7: Set up CASL (client-side only)
- Install `@casl/ability` + `@casl/react`
- Create `src/lib/ability.ts`: `createMongoAbility()` + `defineRulesFor(userType)` function
- Rules are simple role-based (ported from [zads_web/stores/auth.js](zads_web/stores/auth.js) lines 30-43; product labels use Client/Dependent):
  - ADMIN: `{ action: 'manage', subject: 'all' }`
  - CLIENT (API userType `parent` until renamed): e.g. `read:Client`, `manage:Dependents`, `manage:Requests` (or keep subject names as `Parent`/`Children` in code for minimal diff -- align in implementation)
  - TEACHER: `read:Teacher`, `manage:Subjects`, `manage:IncomingRequests`
- Create `AbilityProvider` that reads `userType` from NextAuth session and updates ability rules
- CASL is used ONLY for client-side UI gating (`<Can>` component, `ability.can()` checks). Route-level access is handled by Edge middleware (P0-9)

### P0-8: Set up next-intl
- Install `next-intl`
- Port locale files from `zads_web/i18n/locales/` (ar.json, en.json)
- Configure middleware for locale detection
- Set Arabic as default locale

### P0-9: Set up Edge middleware (auth + role gating -- NO CASL)
- Create `src/middleware.ts` (runs on Edge runtime)
- Use NextAuth's `getToken()` to decode the JWT from the session cookie (Edge-compatible, no CASL dependency)
- Route matching config (`matcher`):
  - Skip: `/_next`, `/api`, static assets
  - Public routes (no check): `/`, `/about`, `/how-it-works`
  - Auth routes (`/login`, `/register/*`, `/forgot-password`): if authenticated, redirect to role-based home
  - `/client/*` (and optionally `/parent/*` redirecting to `/client/*`): require token with `userType` matching client/learner role (see API: today `parent`), else redirect to `/login`
  - `/teacher/*`: require token with `userType === 'TEACHER'`, else redirect to `/login`
  - `/admin/*`: require token with `userType === 'ADMIN'`, else redirect to `/login`
- This replaces [zads_web/middleware/acl.global.js](zads_web/middleware/acl.global.js) with a simpler, Edge-compatible approach

### P0-10: Create layouts
- **Root layout** (`src/app/layout.tsx`): html, body, font, providers (session, i18n, ability, toast)
- **Public layout** (`src/app/(public)/layout.tsx`): navbar + footer (port from [zads_web/layouts/public.vue](zads_web/layouts/public.vue))
- **Auth/blank layout** (`src/app/(auth)/layout.tsx`): minimal centered layout
- **Dashboard layout** (`src/app/(client)/layout.tsx` and `src/app/(teacher)/layout.tsx`): sidebar nav + header (port from [zads_web/layouts/components/DashboardLayout.vue](zads_web/layouts/components/DashboardLayout.vue)) -- client group wraps former parent routes
- **Admin layout** (`src/app/(admin)/layout.tsx`): vertical nav sidebar (port from [zads-dashboard/src/layouts/components/DefaultLayoutWithVerticalNav.vue](zads-dashboard/src/layouts/components/DefaultLayoutWithVerticalNav.vue))

### P0-11: Shared UI components + loading/error patterns
- `PageSkeleton` -- full-page loading skeleton (uses shadcn Skeleton), used by every page during data fetch
- `ErrorBanner` -- error display banner (dismissable, retry button), reads from store's `error` state
- `AppToast` -- toast notification wrapper using shadcn Toast (replaces `AppSnackbar` / `useSnackbar` composable)
- `ConfirmDialog` -- shadcn AlertDialog wrapper for destructive actions
- Define the pattern: every page wraps its content in a conditional that checks store `isLoading` / `error`:

```tsx
// Pattern every page follows:
if (store.isLoading) return <PageSkeleton />;
if (store.error) return <ErrorBanner error={store.error} onRetry={store.fetch} />;
return <ActualContent />;
```

### P0-12: Define Zustand store shape convention
- Create `src/stores/_convention.ts` (or a README) documenting the standard store shape:

```typescript
// Every store slice that fetches data follows this shape:
interface StoreSlice<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;  // sets isLoading, clears error, fetches, sets data
  reset: () => void;           // resets to initial state
}
```

- `fetch()` always: sets `isLoading = true`, clears `error`, tries the API call, sets `data` on success, sets `error` on failure, sets `isLoading = false` in finally
- `reset()` returns the slice to its initial state (used on logout or navigation away)
- Stores do NOT persist to localStorage by default (session cookie via NextAuth is the only persisted auth state)
- Create one example store (`src/stores/_example.ts`) as a reference implementation that all future stores copy from

### P0-13: Validate RTL + font rendering (throwaway test page)
- Create a temporary test page at `/test-rtl` that renders:
  - Arabic text in IBM Plex Sans Arabic
  - A shadcn Card with Button, Input, Select, Dialog
  - A form with labels + inputs (verify label alignment, input direction)
  - A sidebar layout placeholder (verify nav is on the right in RTL)
- Verify: `dir="rtl"` propagates, Tailwind `rtl:` variants work, shadcn components render correctly in RTL
- Fix any issues in `globals.css` or component overrides
- Delete the test page once validated (before Phase 1 begins)

### P0-14: Define shared TypeScript types
- Create `src/types/` with interfaces for key domain entities, derived from zads-api Prisma schema (after **PE-1**):
  - `User` (id, name, phone, email, userType, avatarUrl, ...)
  - `Teacher` (extends User + bio, qualification, lessonTypes, location, ...)
  - `ClientProfile` (maps `Parent` in API: `areaId`, `clientAccountKind` student | guardian, ...)
  - `Dependent` (maps `ParentChild`: id, name, stageId, subjects[])
  - `Subject`, `Stage`, `Governorate`, `City`, `Area`
  - `TutorRequest` (includes `requestTarget` self | dependent, `studyMode` online | offline | both, plus existing fields)
  - `ContactRequest`
  - `TeacherSubject` (includes `priceOnline` / `priceOffline` and legacy in-person price fields)
- These types are used by stores, components, and pages -- locking them here prevents type drift

---

## Phase 1 -- Auth pages

### P1-1: Auth store (Zustand)
- Port [zads_web/stores/auth.js](zads_web/stores/auth.js) -> `src/stores/auth.ts`
- Follows P0-12 convention (`isLoading`, `error`, `reset`)
- Actions:
  - `login(phone, password)`: calls `signIn("credentials", { phone, password })` (NextAuth handles the zads-api call)
  - `registerClient(name, phone, password, clientAccountKind)`: calls zads-api directly (payload includes `clientAccountKind` per PE-2), then `signIn()` to establish session
  - `registerTeacher(name, phone, password)`: same pattern
  - `logout()`: calls `signOut()` (NextAuth clears session)
  - `updateAccount(payload)`: calls `PUT /api/auth/profile` via Axios
  - `uploadAvatar(file)`: calls `POST /api/upload/image` via Axios (direct to zads-api, multipart/form-data), then `updateAccount({ avatarUrl })`
  - `changePassword(payload)`: calls `PUT /api/auth/profile` with password fields
- User data: read from NextAuth `useSession()` for basic info; store holds extended profile data fetched from API

### P1-2: Login page
- Source: [zads_web/pages/login.vue](zads_web/pages/login.vue)
- Target: `src/app/(auth)/login/page.tsx`
- Form: **phone** + password (current app uses phone, not email), validation, error display, "forgot password" link, "register" link
- On success: NextAuth redirects; middleware handles role-based routing
- Must render correctly in RTL (validate against P0-13 baseline)

### P1-3: Register choice page
- Source: [zads_web/pages/register/index.vue](zads_web/pages/register/index.vue)
- Target: `src/app/(auth)/register/page.tsx`
- Choose: **client (learner)** or teacher (copy reflects platform positioning)

### P1-4: Register client (learner) page
- Source: [zads_web/pages/register/parent.vue](zads_web/pages/register/parent.vue)
- Target: `src/app/(auth)/register/parent/page.tsx` (or `register/client/page.tsx` with redirect from old path)
- Form fields: name, phone, password, confirm password, **clientAccountKind** (فردي / ولي أمر) -- API `userType` still `parent` until renamed

### P1-5: Register teacher page
- Source: [zads_web/pages/register/teacher.vue](zads_web/pages/register/teacher.vue)
- Target: `src/app/(auth)/register/teacher/page.tsx`
- Form fields: name, email, phone, password, confirm password + teacher-specific fields

### P1-6: Forgot password page
- Source: [zads_web/pages/forgot-password.vue](zads_web/pages/forgot-password.vue)
- Target: `src/app/(auth)/forgot-password/page.tsx`
- Form: email input, submit, success message

---

## Phase 2 -- Public pages

### P2-1: Landing page
- Source: [zads_web/pages/index.vue](zads_web/pages/index.vue)
- Target: `src/app/(public)/page.tsx`
- Sections: hero, features, how-it-works summary, CTA

### P2-2: About page
- Source: [zads_web/pages/about.vue](zads_web/pages/about.vue)
- Target: `src/app/(public)/about/page.tsx`

### P2-3: How it works page
- Source: [zads_web/pages/how-it-works.vue](zads_web/pages/how-it-works.vue)
- Target: `src/app/(public)/how-it-works/page.tsx`

### P2-4: Public navbar + footer
- Port navbar from public layout
- Port footer component

---

## Phase 3 -- Client / Learner area (7 pages, 5 stores) -- route prefix `/client/*`

### P3-1: Search store (Zustand)
- Port [zads_web/stores/search.js](zads_web/stores/search.js) -> `src/stores/search.ts`
- Actions: fetchSubjects, fetchStages, fetchLocations (governorates/cities/areas), searchTeachers; add **studyMode** filter when API supports it (PE-2)

### P3-2: Client profile store (Zustand)
- Port [zads_web/stores/parent.js](zads_web/stores/parent.js) -> `src/stores/client.ts` (or keep `parent.ts` if you prefer 1:1 with API model name)
- Actions: fetchProfile, updateProfile; read/write **`clientAccountKind`** (فردي / ولي أمر) per PE-1/PE-2

### P3-3: Dependents store (Zustand)
- Port [zads_web/stores/children.js](zads_web/stores/children.js) -> `src/stores/dependents.ts`
- Actions: fetchDependents, add, update, delete; UI copy "dependents" / "تابعون" (API still `parent_children` / `ParentChild` until renamed)

### P3-4: Favorites store (Zustand)
- Port [zads_web/stores/favorites.js](zads_web/stores/favorites.js) -> `src/stores/favorites.ts`
- Actions: fetchFavorites, addFavorite, removeFavorite

### P3-5: Tutor requests store (Zustand)
- Port [zads_web/stores/tutorRequests.js](zads_web/stores/tutorRequests.js) -> `src/stores/tutor-requests.ts`
- Actions: fetchMyRequests, createRequest, closeRequest, deleteRequest; create/update payloads include **`requestTarget`**, **`studyMode`** (PE-1/PE-2)

### P3-6: Contact requests store (Zustand)
- Port [zads_web/stores/contactRequests.js](zads_web/stores/contactRequests.js) -> `src/stores/contact-requests.ts`
- Actions: fetchMyRequests, createRequest, fetchIncomingRequests, updateRequestStatus

### P3-7: Shared components -- TeacherCard (lock props interface FIRST)
- Port [zads_web/components/TeacherCard.vue](zads_web/components/TeacherCard.vue) -> `src/components/shared/TeacherCard.tsx`
- **Define and lock the prop interface before coding** (this component appears in client search results, favorites, teacher dashboard, and browse):

```typescript
interface TeacherCardProps {
  teacher: Teacher;                    // from src/types/
  subjects?: TeacherSubject[];         // optional: shown if available
  isFavorite?: boolean;                // heart icon state
  onToggleFavorite?: (id: string) => void;  // omit to hide the button
  onContact?: (id: string) => void;    // omit to hide contact button
  variant?: 'compact' | 'full';        // compact for dashboard lists, full for search results
}
```
- Renders: avatar, name, subjects/stages tags, rating stars, location, favorite toggle, contact button
- Must support RTL layout

### P3-8: Shared components -- TutorRequestCard (lock props interface FIRST)
- Port [zads_web/components/TutorRequestCard.vue](zads_web/components/TutorRequestCard.vue) -> `src/components/shared/TutorRequestCard.tsx`
- Props: `{ request: TutorRequest; onClose?: (id) => void; onDelete?: (id) => void; showActions?: boolean }`
- Used in client requests page and teacher browse page; **TutorRequest** type must include `requestTarget` and `studyMode` (PE-1)

### P3-9: Shared components -- ContactRequestDialog
- Port [zads_web/components/ContactRequestDialog.vue](zads_web/components/ContactRequestDialog.vue) -> `src/components/forms/ContactRequestDialog.tsx`
- Uses shadcn Dialog + Form; calls contactRequests store

### P3-10: Shared components -- SubjectsDialog
- Port [zads_web/components/SubjectsDialog.vue](zads_web/components/SubjectsDialog.vue) -> `src/components/forms/SubjectsDialog.tsx`
- Uses shadcn Dialog; reads subjects/stages from search store

### P3-11: Dashboard components
- Port from `zads_web/components/dashboard/`:
  - `StatWidget` -> `src/components/dashboard/StatWidget.tsx`
  - `HeroBanner` -> `src/components/dashboard/HeroBanner.tsx`
  - `QuickProfileCard` -> `src/components/dashboard/QuickProfileCard.tsx`
  - `ScheduleTimeline` -> `src/components/dashboard/ScheduleTimeline.tsx`
  - `CourseProgressCard` -> `src/components/dashboard/CourseProgressCard.tsx`

### P3-12: Client / Learner dashboard page
- Source: [zads_web/pages/parent/index.vue](zads_web/pages/parent/index.vue)
- Target: `src/app/(client)/client/page.tsx`
- Uses: client profile store, dependents store, tutorRequests store, contactRequests store, search store
- Displays: stats, teacher search, recent requests, quick profile

### P3-13: Dependents management page
- Source: [zads_web/pages/parent/children.vue](zads_web/pages/parent/children.vue)
- Target: `src/app/(client)/client/dependents/page.tsx` (or `.../children` with "dependents" copy only)
- Uses: dependents store, search store (subjects/stages)
- CRUD: add/edit/delete dependents with stage + subject selection; hide or simplify for **فردي** if product rules say no dependents

### P3-14: Teacher profile view page
- Source: [zads_web/pages/parent/teacher/[id].vue](zads_web/pages/parent/teacher/[id].vue)
- Target: `src/app/(client)/client/teacher/[id]/page.tsx`
- Dynamic route; fetches teacher details; show **online vs offline** prices per subject row; contact + favorite; contact flow can pre-fill **studyMode** when creating requests

### P3-15: Favorites page
- Source: [zads_web/pages/parent/favorites.vue](zads_web/pages/parent/favorites.vue)
- Target: `src/app/(client)/client/favorites/page.tsx`
- Uses: favorites store
- Displays favorited teachers as TeacherCard grid

### P3-16: Requests page (tutor + contact)
- Source: [zads_web/pages/parent/requests/index.vue](zads_web/pages/parent/requests/index.vue)
- Target: `src/app/(client)/client/requests/page.tsx`
- Uses: tutorRequests + contactRequests stores; tutor create/edit forms include **`requestTarget`**, **`studyMode`**
- Tabs: tutor requests list, contact requests list

### P3-17: Client profile page
- Source: [zads_web/pages/parent/profile.vue](zads_web/pages/parent/profile.vue)
- Target: `src/app/(client)/client/profile/page.tsx`
- View/edit client profile; show **account kind** if editable

### P3-18: Client settings page
- Source: [zads_web/pages/parent/settings.vue](zads_web/pages/parent/settings.vue)
- Target: `src/app/(client)/client/settings/page.tsx`
- Account info, location, dependents management (inline), password change

---

## Phase 4 -- Teacher area (6 pages, 2 stores)

### P4-1: Teacher store (Zustand)
- Port [zads_web/stores/teacher.js](zads_web/stores/teacher.js) -> `src/stores/teacher.ts`
- Actions: fetchProfile, updateProfile, fetchStats

### P4-2: Teacher subjects store (Zustand)
- Port [zads_web/stores/teacherSubjects.js](zads_web/stores/teacherSubjects.js) -> `src/stores/teacher-subjects.ts`
- Actions: fetchMySubjects, addSubject, updateSubject; DTOs include **`priceOnline`** and **`priceOffline`** (PE-1) alongside legacy in-person price fields

### P4-3: Teacher dashboard page
- Source: [zads_web/pages/teacher/index.vue](zads_web/pages/teacher/index.vue)
- Target: `src/app/(teacher)/teacher/page.tsx`
- Uses: teacher store, contactRequests store, tutorRequests store
- Displays: stats (views, contacts, rating), recent incoming requests, nearby tutor requests

### P4-4: Browse tutor requests page
- Source: [zads_web/pages/teacher/browse.vue](zads_web/pages/teacher/browse.vue)
- Target: `src/app/(teacher)/teacher/browse/page.tsx`
- Uses: tutorRequests store, search store, teacher store
- Filterable list of tutor requests in teacher's area; filters include **`studyMode`** and **request target** when API exposes them

### P4-5: Teacher requests page
- Source: [zads_web/pages/teacher/requests.vue](zads_web/pages/teacher/requests.vue)
- Target: `src/app/(teacher)/teacher/requests/page.tsx`
- Uses: contactRequests store (incoming), tutorRequests store
- Accept/reject contact requests

### P4-6: Subjects + pricing page
- Source: [zads_web/pages/teacher/subjects.vue](zads_web/pages/teacher/subjects.vue)
- Target: `src/app/(teacher)/teacher/subjects/page.tsx`
- Uses: teacherSubjects store, search store
- Add/edit subjects with pricing per lesson type

### P4-7: Teacher profile page
- Source: [zads_web/pages/teacher/profile.vue](zads_web/pages/teacher/profile.vue)
- Target: `src/app/(teacher)/teacher/profile/page.tsx`
- Uses: teacher store, search store, auth store (avatar upload)
- Edit bio, qualifications, location (governorate/city/area drill-down), lesson types
- Avatar upload: uses auth store's `uploadAvatar()` which calls `POST /api/upload/image` directly on zads-api via Axios (no Next.js proxy)

### P4-8: Teacher settings page
- Source: [zads_web/pages/teacher/settings.vue](zads_web/pages/teacher/settings.vue)
- Target: `src/app/(teacher)/teacher/settings/page.tsx`
- Account info, password change

---

## Phase 5 -- Admin dashboard (9 pages from zads-dashboard)

### P5-1: Admin DataTable component (TanStack React Table)
- Port [zads-dashboard/src/components/AppListingTable.vue](zads-dashboard/src/components/AppListingTable.vue) -> `src/components/admin/DataTable.tsx`
- Install `@tanstack/react-table` (already in target stack)
- Reusable: server-side pagination, search/filter, configurable columns, row actions (edit/delete/view)
- Built on shadcn Table component + TanStack headless table logic
- Must support RTL column ordering

### P5-2: Admin dashboard stats page
- Source: [zads-dashboard/src/pages/index.vue](zads-dashboard/src/pages/index.vue)
- Target: `src/app/(admin)/admin/page.tsx`
- Stats overview cards

### P5-3: Teachers management page
- Source: [zads-dashboard/src/pages/teachers.vue](zads-dashboard/src/pages/teachers.vue)
- Target: `src/app/(admin)/admin/teachers/page.tsx`
- DataTable: list teachers, view/edit details, status toggle

### P5-4: Parents management page
- Source: [zads-dashboard/src/pages/parents.vue](zads-dashboard/src/pages/parents.vue)
- Target: `src/app/(admin)/admin/parents/page.tsx`
- DataTable: list parents, view details

### P5-5: Subjects CRUD page
- Source: [zads-dashboard/src/pages/subjects.vue](zads-dashboard/src/pages/subjects.vue)
- Target: `src/app/(admin)/admin/subjects/page.tsx`
- DataTable + add/edit dialog

### P5-6: Stages CRUD page
- Source: [zads-dashboard/src/pages/stages.vue](zads-dashboard/src/pages/stages.vue)
- Target: `src/app/(admin)/admin/stages/page.tsx`
- DataTable + add/edit dialog

### P5-7: Tutor requests management page
- Source: [zads-dashboard/src/pages/tutor-requests.vue](zads-dashboard/src/pages/tutor-requests.vue)
- Target: `src/app/(admin)/admin/tutor-requests/page.tsx`

### P5-8: Contact requests management page
- Source: [zads-dashboard/src/pages/contact-requests.vue](zads-dashboard/src/pages/contact-requests.vue)
- Target: `src/app/(admin)/admin/contact-requests/page.tsx`

### P5-9: Admin error page
- Source: [zads-dashboard/src/pages/[...error].vue](zads-dashboard/src/pages/[...error].vue)
- Target: `src/app/(admin)/admin/not-found.tsx` (Next.js `not-found` convention)

---

## Phase 6 -- Polish and cutover

### P6-1: i18n verification
- Verify all translation keys ported to `ar.json` / `en.json`
- Spot-check Arabic text rendering on every page (should already be working since RTL was validated per-page, but do a final sweep)

### P6-2: Responsive testing
- Verify mobile + tablet + desktop breakpoints for all pages
- Test RTL at each breakpoint (RTL + mobile is a common failure mode)

### P6-3: API integration verification
- End-to-end test all API calls match existing behavior
- Verify NextAuth session flow: login -> session cookie -> Axios header -> API response -> logout
- Test 401 handling: expired token -> automatic signOut + redirect to login

### P6-4: Update documentation
- Update root `README.md`, `TECH_PLAN.md`, `CODEBASE_OVERVIEW.md`, `FEATURES_OVERVIEW.md`
- Remove all references to `zads_app/` (deleted Flutter mobile app) from `DOCUMENTATION.md`, `TECH_PLAN.md`, `CODEBASE_OVERVIEW.md`, `README.md`
- Add `zads-app/README.md` with setup instructions
- Update `DOCUMENTATION.md` to reflect the new single-app architecture (no more separate dashboard, no mobile app)

### P6-5: Remove old apps
- Delete `zads_web/` directory
- Delete `zads-dashboard/` directory
- Update any CI/deploy configs

### P6-6: URL redirects / aliases
- If any external links exist to the current app's URLs (e.g., bookmarks, shared links, SEO-indexed pages), set up Next.js `redirects` in `next.config.ts`
- **Required**: `301` or `302` from **`/parent/*` → `/client/*`** (same sub-path: `/parent/children` → `/client/dependents` or the chosen client URL scheme)
- Ensure `/teacher/*` and `/admin/*` still match; update only where paths changed
- If the old dashboard was on a separate domain/port, redirect that domain to `/admin/*` routes

---

## Task summary

- **Platform (zads-api)**: 6 tasks (PE-1 through PE-6) -- Prisma, API, docs, E2E; precedes or runs in parallel with `zads-app` work that depends on new fields
- **Wireframes**: 13 key pages (text + image), mobile-first, Client/Dependents/studyMode in copy where relevant
- **Phase 0**: 14 tasks (foundation -- includes RTL validation, store convention, shared types; types depend on **PE-1**)
- **Phase 1**: 6 tasks (auth) -- includes `clientAccountKind` on client registration
- **Phase 2**: 4 tasks (public)
- **Phase 3**: 18 tasks (client / learner area, `/client/*` -- largest phase)
- **Phase 4**: 8 tasks (teacher area, online/offline pricing on subjects)
- **Phase 5**: 9 tasks (admin -- uses TanStack React Table)
- **Phase 6**: 6 tasks (polish + URL redirects, including `/parent` → `/client`)
- **Total**: 6 platform + 13 wireframes + 65 app tasks = **84 deliverables**

## Execution approach

Each task will be planned in detail (expand the "Source" reference, review the Figma design, note exact API calls, define component props/types) and then implemented one by one. Tasks within a phase are ordered by dependency -- stores before pages that use them, shared components before pages that embed them.

## Risks addressed by this plan revision

- **Auth architecture ambiguity** (was P0-6): RESOLVED -- NextAuth credentials provider proxies to zads-api, wraps JWT in session. Decision locked.
- **RTL discovered late** (was deferred to P6): RESOLVED -- RTL is configured in P0-3, validated in P0-13, and enforced per-page in every phase. No RTL debt accumulates.
- **CASL on Edge** (was P0-9): RESOLVED -- CASL is client-side only. Edge middleware does simple role-check via `getToken()`.
- **No loading/error convention**: RESOLVED -- P0-12 defines the standard Zustand store shape. P0-11 defines the UI components. Pattern is locked before any store is written.
- **Shared component prop drift**: RESOLVED -- P3-7 and P3-8 now lock TypeScript interfaces before implementation.
- **TanStack Table not in stack**: RESOLVED -- added to target stack explicitly.
- **Upload flow unclear**: RESOLVED -- direct to zads-api via Axios, no proxy.
- **No URL redirects**: RESOLVED -- P6-6 added; includes `/parent/*` → `/client/*`.
- **Client vs parent product model**: IN PROGRESS -- PE-1/PE-2/PE-3 + UI terminology (Client, Dependents, `requestTarget`, `studyMode`, teacher online/offline prices) are defined above.
