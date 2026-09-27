# Zads (زاد) — Full Implementation Brief for Codex

**Repo:** `github.com/SayedEsmail/zads` (private monorepo)  
**Apps:** `zads-app` (Next.js 16 App Router, Tailwind 4, shadcn, Zustand, next-intl) · `zads-api` (Express, Prisma, PostgreSQL)  
**Prod:** `https://zads.app` · API `https://api.zads.app`  
**Date compiled:** 2026-09-26  
**Audience:** Codex / coding agent — implement in priority order; do not invent scope outside this brief.

---

## 0) Strategic product reposition (MUST inform all copy + UX)

### Goal
Reposition Zads from “private tutoring / سنتر / دروس خصوصية” to:

> **A local learning marketplace that connects a learner with a teacher/trainer** (discovery + contact + coordinate). The platform does **not** operate tutoring centers and must not market itself as private-lesson centers.

### Messaging rules (apply everywhere: i18n, landing, about, how-it-works, CTAs, empty states, emails if any)
| Avoid / remove | Prefer |
|---|---|
| دروس خصوصية / private tutoring | تعلّم مع معلّم / learn with a teacher |
| سنتر / center / قاعة as a core offer | Online **or** meet by mutual agreement |
| احجز درس / book a lesson (until real booking exists) | تواصل ونسّق / contact & coordinate |
| تقييمات حقيقية / real ratings (until review write-API exists) | ملف موثّق / verified profile (use real verification) |
| Mo3alemy leftovers | Zad **or** Zads — pick **one** brand string and use it consistently (recommend: **زاد / Zads** matching domain) |

### Product implications
- De-emphasize or hide **venue/center** session mode from public filters and primary teacher pricing UI until explicitly re-enabled.
- Keep: online + at-learner + at-teacher (individual coordination), dependents, search, contact requests, favorites, admin verification.
- Product truth today: **discovery + contact request + WhatsApp/call after accept** — not payments, not calendar booking, not ratings write-path.

---

## 1) Production facts (do not “fix” by seeding differently)

Observed on production (read-only exploration):
- Working dashboards: `/ar/client`, `/ar/teacher`, `/ar/admin` (NOT `/client/client`, `/teacher/teacher`).
- Docs route map is stale (still mentions nested `client/client`, etc.).
- ~1 teacher, ~1 parent, ~3 public tutor requests, 1 accepted contact; teacher unverified; availability empty.
- Admin overview counts work; several list pages broken.
- Teacher browse + subjects pages show Network Error in UI while some APIs return data.
- Footer `/ar/about` and `/ar/how-it-works` → **404**; real pages under `/ar/public/about`, `/ar/public/how-it-works`.
- Landing CTA `exploreTeachers` goes to how-it-works, not teacher search.
- API `GET /api/teachers/search` is public (`optionalAuth`); UI search is behind parent auth in `proxy.ts`.

---

## 2) Priority backlog

### P0 — Ship before any marketing traffic

#### P0.1 Fix admin teachers & parents tables (pagination `total` crash)
**Symptom:** `/admin/teachers`, `/admin/parents` show `Cannot read properties of undefined (reading 'total')` and empty tables while dashboard counts > 0.  
**Likely cause:** UI expects a paginated shape `{ data, total }` (or similar) that does not match API response.  
**Files (start here):**
- `zads-app/src/app/[locale]/admin/teachers/page.tsx` (and related components/hooks)
- `zads-app/src/app/[locale]/admin/parents/page.tsx`
- `zads-api` admin teachers/parents list controllers/routes (`/api/admin/teachers`, `/api/admin/parents`)
**Do:**
1. Log/inspect actual JSON from admin list endpoints.
2. Normalize either API → `{ items, total, page, pageSize }` **or** adapt UI to current API shape — pick one contract and use it in both pages.
3. Ensure empty state vs error state are distinct.
**Accept:** Tables render real rows; no runtime error; pagination works.

#### P0.2 Fix admin contact-requests Network Error
**Path:** `/admin/contact-requests`  
**Do:** Fix client fetch URL/auth/response parsing; align with API.  
**Accept:** Page lists contact requests; no Network Error toast/state.

#### P0.3 Fix teacher browse Network Error + empty opportunities
**Path:** `/teacher/browse`  
**API:** tutor-requests browse (see `DOCUMENTATION` + `tutor-requests` routes/stores)  
**Also investigate:** geographic filter bug — parent requests in الحي الثالث visible to admin but teacher in الحي الرابع may not see them / page errors.  
**Do:**
1. Fix Network Error (wrong path, auth header, response shape).
2. Define matching rules clearly (same city? same area? adjacent areas?) and implement consistently for teacher browse vs admin list.
3. Empty state only when query truly returns [].
**Accept:** Teacher with matching subject/stage/geo sees nearby open tutor requests; errors handled cleanly.

#### P0.4 Fix teacher subjects Network Error
**Path:** `/teacher/subjects`  
**API:** `GET/POST/PUT /api/teachers/me/subjects`  
**Symptom:** Dashboard shows 1 active subject; subjects page Network Error + “no subjects”.  
**Do:** Align store/page with API response; fix create/edit flows.  
**Accept:** Teacher sees existing subjects/prices; can add/edit without error.

#### P0.5 Footer & public route 404s
**Files:** `zads-app/src/components/layout/Footer.tsx` (and any Header/nav)  
**Do:** Point links to `/{locale}/public/about` and `/{locale}/public/how-it-works` **or** add permanent redirects from `/{locale}/about` and `/{locale}/how-it-works` → public equivalents (prefer both: fix links + redirects).  
**Accept:** No 404 from footer; EN + AR.

#### P0.6 Landing CTA “Explore teachers”
**File:** `zads-app/src/app/[locale]/public/page.tsx` (+ i18n keys)  
**Today:** `exploreTeachers` → how-it-works.  
**Do (preferred):** Add **public teacher browse** page that uses existing public `GET /api/teachers/search`, e.g. `/{locale}/public/teachers`, and point CTA there. Soft-gate contact behind login.  
**Alternative (minimum):** CTA → login/register then client search — but public browse is the real fix.  
**Also:** Update `proxy.ts` so public teachers page is not parent-gated.  
**Accept:** Logged-out visitor can see teachers (or clear empty state) without full client dashboard access; contact still requires auth.

#### P0.7 Forgot-password broken end-to-end
**UI:** `zads-app/src/app/[locale]/auth/forgot-password/page.tsx` posts `/auth/forgot-password`  
**API:** `zads-api/src/routes/auth.routes.js` — no matching route  
**Do:** Either implement API (token email/SMS reset) **or** remove/disable the UI link and page until implemented. Prefer disable with clear message if email infra missing.  
**Accept:** No dead-end that claims reset was sent when API missing.

#### P0.8 Copy purge — repositioning pass (i18n + public pages)
**Files:** `zads-app` i18n `ar.json` / `en.json` (landing, about, how-it-works, marketing strings); public pages; any hardcoded Arabic in teacher-detail contact dialog.  
**Do:**
- Remove/replace private-tutoring / center / “book lessons” / “real ratings” claims per §0.
- Rename booking dialog UX to **Contact request** / طلب تواصل.
- Unify brand Zad vs Zads; remove Mo3alemy from user-visible strings and preferably from `schema.prisma` header comment + `zads-api/src/app.js` boot log.
**Accept:** Grep for خصوصي|سنتر|private tutoring|book a lesson|real ratings|Mo3alemy in user-facing strings returns none (or only historical comments marked TODO).

#### P0.9 Persist `studyMode` on contact create
**Bug:** Contact dialog collects `studyMode` but `createRequest` in contact-requests store omits it; mode not saved.  
**Files:** `zads-app/.../client/teacher/[id]/page.tsx`, contact-requests store, API contact-request model/controller.  
**Do:** Add field to API schema if missing; send from client; show on teacher incoming + admin.  
**Accept:** Chosen study mode stored and visible after submit.

---

### P1 — Trust, consistency, teacher onboarding

#### P1.1 LessonType vs StudyMode vs docs
**Schema:** `LessonType` = `at_teacher|at_student|group|any`; parallel `StudyMode` = `online|offline|both`. Docs claim 4 places including online + venue.  
**Do:**
- Document one canonical model in code comments + `DOCUMENTATION.md`.
- UI: primary **online / at student / at teacher**; hide or gate `group`/venue for public launch.
- Ensure teacher subject pricing columns match what UI edits.

#### P1.2 Verification badge on TeacherCard
Verification upload + admin toggle + badge on detail exist; list card may omit `isVerified`.  
**File:** `TeacherCard.tsx` vs teacher detail page.  
**Do:** Show verified chip on cards and public search results.

#### P1.3 WhatsApp CTA + analytics
API: `POST /api/analytics/whatsapp-click` + `WhatsAppClick` model.  
UI: TeacherCard uses generic message icon; accepted contacts may show WA/call.  
**Do:** Clear WhatsApp button where phone exists (post-accept and/or per product rules); fire analytics endpoint; do not expose phone before accept if that’s current policy — keep policy consistent.

#### P1.4 Ratings: implement write-path OR strip claims
No `Rating`/`Review` model; only `avgRating` / `ratingCount`.  
**Do:** Either add review submit after completed contact **or** keep aggregates hidden until real data (preferred short-term: don’t show fake “real ratings” marketing; show “New” when count=0).

#### P1.5 Teacher availability usable
Page exists; often empty.  
**Do:** Ensure save/load works; show next availability on teacher detail (read-only for learners). Not a full booking calendar.

#### P1.6 Settings pages “still under migration”
Finish or remove misleading copy on client/teacher settings.

#### P1.7 Update DOCUMENTATION.md route table
Flat routes: `client/*`, `teacher/*`, `admin/*`, `public/*` — remove nested `*/client` docs paths. Document public teachers search, contact vs booking, verification, no payments.

#### P1.8 Admin operational actions
Ensure admin can: verify teacher, toggle active, review certificate, filter by phone/area/verification. Fix any actions broken by P0.1 response shape.

#### P1.9 Contact request studyMode + optional message already partially there — harden validation & success toasts (client + teacher).

#### P1.10 Hide/disable Comparison models in schema from implying features — no UI; either wire later or leave unused without marketing.

---

### P2 — Growth / polish (after P0)

- Public landing page for **6th of October** (local SEO) under `public/`.
- Strong **Join as teacher** landing section/page.
- Privacy + Terms + Contact linked in footer (create pages if missing).
- SEO: titles, descriptions, OG for AR/EN public pages.
- Mobile CTA pass on landing.
- Redirect legacy nested URLs if any bookmarks exist.
- Email/push notification when teacher receives contact request (if infra allows).
- Fix EN locale hardcoded Arabic in contact dialog.
- Client empty states when no teachers in area (suggest widen filters / online).

---

## 3) Explicit non-goals (do not build in this pass)

- Payments / wallet / checkout
- Full booking calendar / reservations inventory
- OTP auth (unless required for forgot-password you choose to implement)
- Expanding to other countries
- Rebuilding legacy Vue/Nuxt
- Fake seed ratings or fake teacher counts for marketing screenshots

---

## 4) Suggested implementation order for Codex

1. P0.5 Footer/redirects (quick win)  
2. P0.8 Copy repositioning (i18n + public)  
3. P0.1 + P0.2 Admin lists  
4. P0.3 + P0.4 Teacher browse + subjects  
5. P0.6 Public teachers browse + CTA + proxy  
6. P0.7 Forgot-password (disable or implement)  
7. P0.9 studyMode on contact  
8. P1.2 verified chip  
9. P1.1 mode model cleanup  
10. P1.7 DOCUMENTATION.md  
11. Remaining P1 then P2  

---

## 5) Engineering conventions

- Match existing stack; no new framework.
- Prefer fixing response contracts in one place (API wrapper / Zod parse) over scattered `?.total`.
- AR + EN strings together.
- Do not commit secrets; do not change production credentials.
- Add/adjust tests if the repo already has a pattern; otherwise manual checklist below.
- Open PRs with clear titles: `fix(admin): teachers/parents pagination`, etc.

---

## 6) Manual QA checklist (production or staging)

### Public
- [ ] `/ar`, `/ar/public` load; no خصوصي/سنتر/احجز in hero  
- [ ] Footer about & how-it-works (no 404)  
- [ ] Explore teachers → public list or clear auth funnel  
- [ ] `/en` mirrors messaging  

### Client (parent)
- [ ] Search filters work; teacher detail opens  
- [ ] Contact request sends; studyMode persisted  
- [ ] Dependents / requests / contacts / favorites no regressions  

### Teacher
- [ ] Dashboard stats load  
- [ ] Browse shows matching requests or honest empty  
- [ ] Subjects list + add/edit works  
- [ ] Incoming requests + accept/reject still work  
- [ ] Availability save/load  

### Admin
- [ ] Overview counts  
- [ ] Teachers table rows + pagination  
- [ ] Parents table rows + pagination  
- [ ] Contact-requests page works  
- [ ] Subjects/stages unchanged OK  
- [ ] Verify teacher toggles reflected on public card  

### Auth
- [ ] Forgot-password: either works or clearly unavailable  

---

## 7) File / area cheat sheet

| Area | Paths |
|---|---|
| Public landing | `zads-app/src/app/[locale]/public/` |
| Footer | `zads-app/src/components/layout/Footer.tsx` |
| Proxy / auth gates | `zads-app/src/proxy.ts` |
| i18n | `zads-app` locale JSON (`ar.json`, `en.json`) |
| Client teacher search | `zads-app/src/app/[locale]/client/teacher/` |
| Contact store | `zads-app/src/stores/contact-requests.ts` (name may vary) |
| Teacher browse/subjects | `zads-app/src/app/[locale]/teacher/` |
| Admin pages | `zads-app/src/app/[locale]/admin/` |
| Teachers API | `zads-api/src/routes/teachers.routes.js`, controllers |
| Auth API | `zads-api/src/routes/auth.routes.js` |
| Schema | `zads-api/prisma/schema.prisma` |
| Handbook | `DOCUMENTATION.md` |

---

## 8) One-shot prompt you can paste into Codex

```
Implement the Zads monorepo brief in CODEX_IMPLEMENTATION_BRIEF.md (or the message this was pasted from).

Repo: SayedEsmail/zads. Work P0 first in the order in §4. Reposition all user-facing copy away from private tutoring/centers/booking/fake ratings toward learner↔teacher discovery + contact. Fix admin pagination total crash, admin contact-requests, teacher browse + subjects Network Errors, footer 404s, public explore-teachers CTA (add public teachers search using existing public API), forgot-password dead end, and persist studyMode on contact create. Then P1 verification chip, StudyMode/LessonType cleanup, WhatsApp CTA+analytics, docs route update. Do not add payments or full booking. Match existing Next.js/Express/Prisma patterns. Open focused PRs or commits per P0 item with QA notes.
```

---

## 9) Context for humans (not for Codex scope creep)

- Side project by Sayed (web developer); Egypt-first; start density in 6th of October.
- Legal climate: government pressure on سناتر / private-lesson centers — product framing change is intentional risk reduction, not optional copy fluff.
- Organic marketing planned after P0; paid ads later.
