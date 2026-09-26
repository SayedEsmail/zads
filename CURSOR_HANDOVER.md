# Zads — Cursor handover

Updated: 2026-09-26, after production database reconciliation, frontend promotion, and production read checks.

## 1. Start here

Continue the existing implementation. Do not restart the original plan, redesign the product, or generate another broad audit before addressing concrete failures.

- Repository: `/home/sayed/Devs/zads` (the old `/home/sayed/zads` path is obsolete).
- Remote: `git@github.com:SayedEsmail/zads.git`; branch: `main`.
- Permanent product domain: **https://zads.app**.
- Backend: **https://api.zads.app**.
- Product positioning: **teacher ↔ learner discovery, contact, and coordination**. A learner can act for themselves or as a guardian for dependents.
- Do not reintroduce private-tutoring/center positioning, unsupported booking promises, fake reviews, universal verification claims, or fabricated support contacts.
- Wording changes are not a legal compliance determination.
- The owner explicitly prohibited browser automation. They review the browser themselves. HTTP/API checks are allowed.
- Communicate with the owner in Egyptian Arabic; implementation instructions and this handover are English.
- Keep work economical; cheap agents were authorized when useful. Avoid repeated review/report loops.
- The owner explicitly authorized the production migration and frontend deployment described below. Those operations have already happened; do not repeat them by default.
- Never print credentials, JWTs, private response bodies, or verification documents.

## 2. Actual current state

The earlier production failure had two separate causes:

1. API deployment failed during dependency installation: `packages field missing or empty`. Both standalone `pnpm-workspace.yaml` files now declare `packages: ['.']`. A clean API install using pnpm 9.15.9 and Prisma generation succeeded.
2. Once the API deployment succeeded, its newer Prisma client encountered missing production columns, initially `teachers.verified_at`. Production had the first six migrations recorded plus some manually existing fields from later work. The final two migrations were reconciled and recorded on the SAME database.

The latest frontend was then built on Vercel and promoted to production. This was not a DNS/provider/database replacement.

Verified after repair:

- `GET https://api.zads.app/api/teachers`: 200; one teacher returned.
- `GET https://zads.app/api/teachers`: 200; one teacher returned.
- Public teacher detail: 200.
- Public search does not expose the teacher's phone.
- CORS preflight: 204, permitting `Content-Type`, `Authorization`, and `Idempotency-Key`.
- `/ar/about` redirects to `/ar/public/about`, ending at 200.
- `/ar/how-it-works` redirects to `/ar/public/how-it-works`, ending at 200.
- `/ar/public/teachers`: 200; old private-tutor directory wording absent from returned HTML.
- 28 authenticated production GET checks passed, listed below.

Do not equate these results with a complete browser E2E test or unconditional campaign readiness.

## 3. Repository layout and important files

- `zads-app/`: Next.js 16, React 19, TypeScript, next-intl, Auth.js/NextAuth, Zustand, Axios.
- `zads-api/`: Express, Prisma 5, PostgreSQL, JWT authentication.
- Each app is a standalone package with its own lockfile/workspace file. There is no root package.json or root pnpm workspace.
- `legacy/`: historical frontend code; do not edit it for current product fixes.

Frontend areas:

- `src/lib/api.ts`: authenticated Axios client and anonymous public client; BOTH always use same-origin `/api`.
- `next.config.ts`: backend proxy and legacy-route redirects. Backend origin is server-side `API_BASE_URL`.
- `src/stores/search.ts`: anonymous public discovery is explicitly selected; authenticated account search retains account defaults.
- `src/stores/contact-requests.ts`: stable request idempotency keys, error propagation, updated accepted-contact records.
- `src/app/[locale]/public/teachers/`: directory and public teacher details.
- `src/app/[locale]/client/teacher/`: learner search/detail.
- `src/app/[locale]/teacher/`: teacher dashboard, subjects, availability, opportunities.
- `src/app/[locale]/admin/`: admin tables, contact requests, verification.
- `src/i18n/locales/{ar,en}.json`: bilingual copy.

Backend areas:

- `src/app.js`: middleware/CORS/routes; allows `Idempotency-Key`.
- `src/controllers/teachers.controller.js`: public privacy, geographic/mode/price filters, subjects and availability.
- `src/controllers/contactRequests.controller.js`: participant access, recipient-only transitions, idempotency, accepted-only phone disclosure.
- `src/controllers/tutorRequests.controller.js`: eligible teacher opportunity browsing and learner requests.
- `src/controllers/upload.controller.js`: certificate ownership and authorized access.
- `src/routes/admin.routes.js`: includes `/contact-requests`.
- `prisma/schema.prisma` and `prisma/migrations/`: schema and eight migrations.

## 4. Work already implemented

### Public product and discovery

- Teacher/learner positioning across landing, about, how-it-works, join-teacher, directory, and metadata in both languages.
- Removed unsupported real-review and private-tutor claims; removed booking language from availability/dashboard copy.
- Public teacher discovery and profiles; login/register return flow preserves a validated internal callback to the selected teacher.
- Domain defaults use zads.app; short about/how-it-works links redirect correctly.
- Public search does not call session retrieval or inherit parent-specific filters.
- Directory initially shows loading, rather than claiming zero teachers before the first request.
- Distinct fetch-error state, retry, result-page navigation, and location matching in the local text filter.
- Removed hard-coded location pills that did not perform reliable geographic filtering.
- Visible min/max price inputs in public and learner search, with integer/nonnegative/order validation.
- Important remaining limitation: public free-text search filters the current result page, not the complete database. The UI labels it accordingly. Do not call this full server-side text search.

### Authentication, contacts, and privacy

- Incorrect credentials result in a real login failure.
- Callback paths survive login/registration without allowing external redirects.
- Same-origin API routing prevents stale public API-origin configuration from causing cross-origin dashboard failures.
- Admin pagination aligns with `{ data, pagination: { total, ... } }`.
- Admin contact-request list implemented.
- Phone numbers are omitted from public results and unaccepted contact records; accepted participants can access contact details.
- Request status changes are recipient-only and checked atomically; senders cannot accept their own request.
- Contact creation persists studyMode and other material fields.
- Idempotency keys survive retry; conflicting material payloads and opposite-direction reuse do not silently return unrelated records.
- Teacher-initiated contact requires a matching eligible active learner request.
- Accepted request updates refresh contact data; write failures propagate to the UI.
- Certificate access uses trusted endpoints and Authorization headers, not account JWTs in URLs. Ownership is assigned server-side; changing a certificate invalidates verification.

### Teacher data and matching

- Mode flags `isOnline`/`isOffline` are explicit in subject configuration and used consistently in search/pricing displays.
- Price ranges match the selected mode rather than mixing online/offline price columns.
- Explicit locations are respected; online discovery is not automatically constrained to the account location.
- Teacher opportunity browsing no longer queries unsupported schema fields; expiry/ownership/eligibility cases were addressed.
- Availability validation is implemented. This is coordination availability, not a full booking engine.

## 5. Production database work — already completed

No database was replaced, reset, or seeded. No records were deleted.

Previously recorded migrations:

- `20251226124027_zads`
- `20251227021545_add_locations`
- `20251227104301_add_parent_children`
- `20251227113221_add_tutor_request_area`
- `20260425000000_platform_evolution_client_study_mode`
- `20260518194436_init`

Applied/reconciled and recorded in this session:

- `20260926160000_complete_platform_contracts`
- `20260926170000_contact_idempotency_and_analytics_funnel`

Production already contained certificate_url, school_type, initiated_by, reply_message, and teacher_availabilities. Blindly replaying the original migration would have failed on existing objects. The reconciliation inspected existing objects, applied missing additions in a transaction, checked row counts, then recorded completion through Prisma `migrate resolve --applied`.

Changes included verification audit fields, teaching capability flags, contact study/place/time/request-link/idempotency fields, analytics events, and supporting indexes/constraints. The migration backfilled `teacher_subjects.is_online = true` where `price_online IS NOT NULL`. This was a deliberate data-field update, not only DDL.

Before/after counts were identical:

| Table | Count |
| --- | ---: |
| teachers | 1 |
| parents | 1 |
| parent_children | 1 |
| teacher_subjects | 1 |
| contact_requests | 1 |
| tutor_requests | 3 |
| teacher_availabilities | 0 |

No duplicate pending contact groups were found. All eight migrations are recorded as applied.

Operational scripts:

- `zads-api/scripts/production-schema-task.js`: no-op unless `ZADS_DB_TASK=audit` or `reconcile` is explicitly supplied.
- `zads-api/scripts/reconcile-production-migrations.js`: narrowly handles the two migrations above; preserves existing objects and checks row counts.
- `zads-api/scripts/check-production-reads.js`: no-op unless `ZADS_READ_CHECK=1`; runs only a fixed GET allowlist using existing active role accounts and short-lived, in-memory tokens. It never logs tokens or response bodies.

These scripts are NOT wired into normal builds. During this session a temporary `vercel-build` script invoked them in Vercel's production build environment with `--skip-domain`; that package.json hook was removed afterward.

Production DATABASE_URL, DIRECT_URL, and JWT_SECRET are Sensitive Vercel variables. They cannot be exported using `vercel env pull`; it returns `[SENSITIVE]` placeholders. Do not overwrite production settings with these placeholders. Database tasks were run within Vercel, without exporting those values. Do not ask the owner to paste credentials into chat.

## 6. Vercel and deployment access

- Team: `sayed-esmail-s-projects`
- Team ID: `team_POssmYZSb9y1uVShEihcUHWF`
- API project: `zads-api`, ID `prj_OkZHaRijKKjUPc7l4ybcSmZXyFZ2`
- Frontend project: `zads-app`, ID `prj_13QaUFDCpWTYWJvsLMe3pRMqJoKg`
- Vercel CLI login succeeded for account `5atabwork-4960`; both local package directories are linked via ignored `.vercel/project.json` files.
- The connector initially required reconnect/team authorization. Read tools now work. Its get_project argument mapping and deploy_to_vercel tool failed; use the CLI for operational work.

Last explicitly verified live application deployments:

- API: `dpl_EXXw9wqmDFDBrCSQN8R4pbPQ52SQ`, commit `5aa4620`, READY, alias api.zads.app.
- Frontend: `dpl_8knEjgfMQZ7rbVaPZuzX5y1AE45J`, source at `5aa4620`, READY, manually promoted; verified through zads.app.
- Frontend immutable URL: `https://zads-fk47yup75-sayed-esmail-s-projects.vercel.app`.
- Subsequent operational check deployments used `--prod --skip-domain`. They may appear newer in the deployment list but were NOT promoted. Do not mistake the newest deployment for the domain's active deployment.
- Later repository commits add operational utilities/documentation; the application changes are included in the deployed source above. Re-check aliases if further CI deployments happen.

CLI installation used: Vercel 59.25.4. Cached executable on this workstation:

```sh
export PATH=/home/sayed/.nvm/versions/node/v24.20.0/bin:$PATH
node /home/sayed/.npm/_npx/0ba70bd8308c98e3/node_modules/vercel/dist/vc.js whoami
```

If that cache is absent, use `npx --yes vercel@59.25.4`. Never put auth tokens in command arguments or reports.

Run deployment commands from the correct linked package directory. For a prepared production build without switching domains:

```sh
vercel deploy --prod --skip-domain --yes
# Inspect/build/verify first, then explicitly promote the chosen URL:
vercel promote <verified-deployment-url> --yes
```

`zads-api/.vercelignore` now excludes local PostgreSQL test files, node_modules, env files, service-account credentials, and tests. Do not upload `.test-pgdata`.

Potential CI follow-up (not fixed in this session): GitHub workflows pin pnpm 8 while lockfiles are v9, run package-filter commands from a repository without a root package.json, and frontend lint can block deployment. Inspect actual workflow logs before changing CI. Do not assume git push means a new frontend is live; direct CLI deployment was needed here.

## 7. Test evidence and exact commands

Use explicit working directories. The shell used here was `/bin/bash`, login=false. Node is at `/home/sayed/.nvm/versions/node/v24.20.0/bin/node`.

Frontend checks passed after the application changes:

```sh
cd /home/sayed/Devs/zads/zads-app
export PATH=/home/sayed/.nvm/versions/node/v24.20.0/bin:$PATH
node node_modules/eslint/bin/eslint.js src --quiet
node node_modules/typescript/bin/tsc --noEmit --incremental false
node tests/public-discovery.cjs
API_BASE_URL=http://127.0.0.1:59999 NEXT_PUBLIC_APP_URL=https://zads.app NEXT_TELEMETRY_DISABLED=1 pnpm build
```

The public-discovery test covers anonymous search despite session retrieval failure, first-render loading, retryable errors, same-origin API configuration, and preservation of authenticated request headers/idempotency.

Backend integration checks passed on a disposable database:

```sh
cd /home/sayed/Devs/zads/zads-api
export PATH=/home/sayed/.nvm/versions/node/v24.20.0/bin:$PATH
node scripts/test-local.js
```

This runner creates isolated embedded PostgreSQL, overrides database/JWT/test configuration, applies all eight migrations, runs three HTTP suites, and cleans up. Suites:

- `tests/e2e-complete-flow.test.js`
- `tests/z03-admin-contracts.test.js`
- `tests/z04-z08-privacy-contracts.test.js`

Never run mutating integration suites against production. The test guard requires test mode and an explicit loopback database.

Production authenticated read checks on 2026-09-26 passed for all following routes through BOTH `https://api.zads.app/api` and `https://zads.app/api` (14 paths × 2 = 28 HTTP 200s):

- Learner/parent: `/parents/me`, `/parents/me/children`, `/contact-requests/my`, `/tutor-requests/my`.
- Teacher: `/teachers/me`, `/teachers/me/subjects`, `/teachers/me/availability`, `/teachers/me/stats`, `/contact-requests/incoming`, `/tutor-requests`.
- Admin: `/admin/dashboard`, `/admin/teachers`, `/admin/parents`, `/admin/contact-requests`.
- Admin contact list was also checked for an array and numeric `pagination.total`.

Checks ran in a controlled Vercel build with existing account IDs and in-memory 5-minute tokens; no sessions, passwords, contact requests, or other account records were created/changed by that check. This is backend/proxy evidence, NOT browser login or write-flow evidence.

Local evidence (may be cleaned from /tmp later):

- `/tmp/zads-dashboard-tests.log`, `/tmp/zads-dashboard-build.log`
- `/tmp/zads-schema-audit2.log`, `/tmp/zads-schema-reconcile.log`
- `/tmp/zads-app-production-deploy.log`
- `/tmp/zads-production-reads.log`

## 8. Still unverified / deferred — be explicit

1. No automated browser checks were performed by Codex; the owner prohibited them. The owner's earlier screenshots were from older deployments and pre-migration failures.
2. A new contact request → recipient acceptance → contact disclosure has NOT been exercised end-to-end on production after this repair. Isolated integration tests cover the logic. Do not send real-user requests/messages just to claim completion.
3. Real Firebase push delivery remains disabled/unconfigured, not operationally verified. No fake registration tokens should be reintroduced.
4. A confirmed support/recovery channel and automated password-reset provider remain external work. Do not fabricate an email address or claim reset delivery works.
5. Certificate authorization code was repaired and integration-tested, but persistent upload/storage behavior on serverless Vercel still needs a real deployment check. Inspect disk-backed upload implementation before promising durable document storage.
6. No payments, full calendar booking, or OTP expansion was requested. These remain non-goals unless the owner changes scope.
7. Public free-text search is page-local. Learner search text behavior and complete pagination UX warrant focused review if requested; do not confuse numeric/mode filtering with full text search.
8. Broader SEO/growth pages, teacher supply acquisition, marketing operations, and legal review are not complete merely because technical blockers were repaired.

## 9. Commit trail and historical documents

Useful commits, newest application/operations changes first:

- `3f64c41`: explicit production schema tools and deployment exclusions.
- `5aa4620`: pnpm workspace package declarations; fixed Vercel install blocker.
- `308b13f`: same-origin API routing, visible price filters, availability copy, regression coverage.
- `04ecf49`: public loading/discovery, bilingual positioning, legacy redirects.
- `5873efe`: final R1–R8 privacy/auth/contact/mode fixes and isolated test runner.
- Older commits implemented the first broad platform plan; inspect git history if needed.

This handover and the production read-check utility are committed after the commits above. Use `git log -1` for the handover commit ID.

Historical references:

- `CODEX_IMPLEMENTATION_BRIEF.md`: original proposal, not proof of completion.
- `ZADS_REVIEW_AND_EXECUTION_PLAN.md`: broad Z01–Z19 plan, not a reason to restart everything.
- `FINAL_REVIEW_FIX_SCOPE.md`: targeted R1–R8 findings and local closeout.

Statements in older documents saying no production changes were performed describe an earlier point in time. They are superseded by the explicitly authorized database reconciliation and deployment recorded here. Likewise, old production screenshots showing CORS failures/admin 404s are not the latest state: current read checks passed.

## 10. Suggested next action

Ask the owner for the next concrete change or the result of their manual browser pass. If continuing verification, focus on one controlled request flow and certificate storage with the owner's agreed test accounts. Check the current commit and live deployment before editing. Fix a reproducible failure once, run the relevant checks, and report the exact outcome and remaining limits. Do not restart a general audit/report cycle.
