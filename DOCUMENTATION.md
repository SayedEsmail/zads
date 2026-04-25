# Zads — unified documentation

This is the **single documentation file** for the whole repository (product + platform).  
Canonical technical references:

- `TECH_PLAN.md` (unified technical plan)
- `CODEBASE_OVERVIEW.md` (repo map)
- `FEATURES_OVERVIEW.md` (feature map)

---

## 1) What is Zads? (product, non-technical)

**زاد (Zads)** is a **local learning community** that connects anyone who wants to learn—whether a student, a working adult, or a parent looking for help for their children—with teachers and trainers in the **same city and area**. The idea is **«الجيرة التعليمية»** (neighborhood learning): making access to good instruction easy and **geographically close**.

In one line: *Zads is the link between a strong teacher and a neighbor who needs a lesson, one tap away—with every reasonable option for **where and how** the session happens.*

### Where and how can sessions happen? (four options)

The platform is built around **flexibility of place and format**. In the product, learners and teachers can work with up to **four** session modes (see **§4** for how this appears in code today):

1. **Online** — lessons over the internet.  
2. **At the learner’s place** — the teacher comes to you.  
3. **At the teacher’s place** — you go to the teacher.  
4. **At a dedicated venue** — e.g. a center or classroom (قاعة / سنتر).

*Note: the live codebase uses a `LessonType` enum and related fields; a clearer split of **online vs offline** pricing and filters is part of the planned platform evolution (see the React migration plan / API backlog).*

### Benefits for the **client** (learner or parent)

- **Instant discovery** — when you open the app, you see teachers available in your city/area, without a long search loop.  
- **Household in one account** — manage your **own** lessons and/or your **dependents** (e.g. children) from a single account (product direction; current UI still centers “parent + children” in many places).  
- **Requests that reach teachers** — when you add a subject you want to learn, the system can surface **tutor requests** that nearby teachers see, so they can reach out.  
- **Favorites** — keep teachers you like for later.

### Benefits for the **teacher**

- **Strong local visibility** — you become visible to people in your city/area who need your subject.  
- **Opportunities in your area** — you get **tutor requests** and signals from clients near you, reducing the need to market yourself from scratch.  
- **You set the terms** — where you teach (including online vs offline, as modeled in the product and API), which subjects, and your prices.  
- **Insight** — profile views and engagement-style stats to see interest in your services.

### Strategy (engineering)

- **Phase 1**: web-first. The mobile app is **not** part of the current repo.  
- **In progress**: consolidating the public web and admin into a **Next.js + TypeScript** app; evolving the data model for **client vs guardian**, **dependents**, **request target**, **study mode**, and **online/offline** pricing (see the development plan in `.cursor/plans/react_migration_tasks_add84281.plan.md`).

---

## 2) Applications (repository)

- `zads_web/`: client (learner/parent) + teacher web app (Nuxt 3)  
- `zads-api/`: REST API (Express + Prisma + Postgres)  
- `zads-dashboard/`: admin dashboard (Vue 3 + Vite)  

---

## 3) User types & capabilities (code + product)

| In product copy | In API / routes today | Core capabilities |
|-----------------|----------------------|-------------------|
| **Client / learner** (طالب، موظف، أو ولي أمر) | `userType=parent` (routes under `/parent/*`) | Profile, **dependents/children**, search, favorites, tutor requests, contact requests |
| **Teacher** | `userType=teacher` | Profile, subjects & pricing, lesson **types** (place / format), contact requests, browse nearby tutor requests, stats |
| **Admin** | `userType=admin` | Operate the dashboard: users, subjects, stages, requests |

*Terminology in the UI and docs is moving from “parent-only” to **anyone who learns** (self or dependents), aligned with the platform evolution plan.*

---

## 4) Core feature map (where to look in code)

For the full map, see `FEATURES_OVERVIEW.md`. Highlights:

- **Auth**: `zads_web/pages/login.vue`, `zads_web/stores/auth.js`, `zads-api/src/routes/auth.routes.js`  
- **Client dashboard**: `zads_web/pages/parent/index.vue`  
- **Dependents / children**: `zads_web/pages/parent/children.vue`, API in `zads-api/src/routes/parents.routes.js`  
- **Teacher search**: `zads_web/stores/search.js`, API `GET /api/teachers/search`  
- **Teacher profile**: `zads_web/pages/parent/teacher/[id].vue`, API `GET /api/teachers/:id`  
- **Favorites**: `zads_web/stores/favorites.js`, API `/api/favorites`  
- **Tutor requests**: `zads_web/stores/tutorRequests.js`, API `/api/tutor-requests`  
- **Contact requests**: `zads_web/stores/contactRequests.js`, API `/api/contact-requests`  
- **Admin dashboard pages**: `zads-dashboard/src/pages/*.vue`  

**Lesson / session “place” in the API (today)** — see `LessonType` in `zads-api/prisma/schema.prisma`: `at_teacher` (at teacher’s place), `at_student` (at student’s place), `group` (useful for center / group context), `any`. Tutor requests and teacher subjects refer to these for **where** a session runs; **online** is being modeled more explicitly in the platform roadmap.

---

## 5) Important behavior / rules

- **Auto tutor-request creation**: when a parent adds a child with subjects, the API can auto-create tutor requests per subject (`zads-api/src/controllers/parents.controller.js` — `addChild`).

---

## 6) Local running (quick)

Use the root `README.md` for step-by-step commands. The canonical technical notes live in `TECH_PLAN.md`.
