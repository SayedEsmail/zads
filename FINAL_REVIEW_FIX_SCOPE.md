# Zads final code review — fixed remediation scope

Reviewed local commit: 1f89cb2. Review date: 2026-09-26.
Approved live domain: https://zads.app/. Do not change DNS or the product domain.

This review inspected the actual local checkout at /home/sayed/Devs/zads.
The worktree was clean before review. This file is a review deliverable, not an implementation change.

## Verification performed

- TypeScript: `node node_modules/typescript/bin/tsc --noEmit --incremental false` in zads-app: PASS.
- ESLint: `node node_modules/eslint/bin/eslint.js src --quiet` in zads-app: FAIL, five errors.
- Executed the real controller source in an isolated Node VM with mocked database/file dependencies: confirmed arbitrary certificateUrl acceptance, document authorization based on that mutable URL, and changed-payload retries returning an old request as success.
- Confirmed admin document-link construction appends the administrator API token to the teacher-controlled URL. Used a synthetic token and an .invalid host; no network requests or real document reads were made.
- Did not run production operations, database integration suites, migrations, a production build, or browser E2E. Existing HTTP integration tests are not browser evidence.

## Required fixes — one implementation pass

### R1 — Critical: certificate ownership and administrator-token exposure

Evidence:
- zads-api/src/controllers/teachers.controller.js, updateTeacher: accepts arbitrary certificateUrl from the teacher.
- zads-api/src/controllers/upload.controller.js:133-137: grants access if that editable URL includes the requested filename.
- zads-app/src/app/[locale]/admin/teachers/page.tsx:153-162: appends the admin API token to the stored URL and navigates to it.
- zads-api/src/middlewares/auth.js:53 onward: accepts account JWTs in document query parameters.

Impact: a teacher can point the certificate link to an external host; an administrator opening it sends their API token to that host. A teacher who knows another document filename can also set their own URL to it and pass the current ownership check. Filename secrecy is not authorization.

Fix: assign document ownership server-side at upload; allow attachment only of an upload owned by the authenticated teacher. Do not trust arbitrary external certificate URLs. Fetch authorized documents through a fixed trusted endpoint with a header, or use a document-scoped short-lived mechanism, never an account JWT in a URL. Changing the certificate must invalidate the previous verification decision. Preserve old-file privacy.

Acceptance: hostile external URL cannot receive any token; changing the profile cannot grant access to another teacher's known file; owner/admin can view their authorized file in a browser; visitor/other teacher cannot; changing a certificate removes its previous verification status.

### R2 — Approved domain and honest support details

Evidence: zads-app/src/app/sitemap.ts:4, robots.ts:4, app/[locale]/layout.tsx:19 default to zads.education. forgot-password and public/contact publish support@zads.education.

Fix incorrect references to the approved zads.app configuration. Do not invent support@zads.app. If an actual support channel is unavailable, state that dependency honestly and remove the fabricated contact route. No DNS changes.

Acceptance: generated metadata/sitemap use zads.app; no unapproved zads.education reference or invented support contact appears in the product.

### R3 — Complete the post-authentication return flow

Evidence: public/teachers/[id]/page.tsx:90 supplies callbackUrl, but auth/login/page.tsx:38-42 always routes to the role home. Client registration also routes to the dashboard and does not preserve the selection.

Fix: carry a validated internal callback through login and registration; return to the selected teacher with the correct role. Do not automatically submit contact requests.

Acceptance: logged-out visitor selects a teacher, logs in OR registers, and returns to that teacher in both AR and EN. Reject external callback URLs.

### R4 — Real push registration, or explicitly disabled push

Evidence: components/shared/PushNotificationRegistrar.tsx:32 and requestNotificationAccess generate `web_token_` with Math.random instead of obtaining an FCM registration token. The service worker fallback does not implement Firebase token acquisition.

Fix: implement actual provider token acquisition and a compatible worker if configured. When unconfigured, disable registration honestly and do not persist fabricated tokens. Actual delivery remains an external verification dependency; a manual pilot can proceed only with a real follow-up arrangement.

Acceptance: no fabricated token is created; unconfigured push does not block a contact request or claim delivery; configured push requires a real delivery test before being labeled operational.

### R5 — Correct idempotency and request eligibility

Evidence: contactRequests.controller.js:44-85 checks participant IDs but not the request payload or initiation direction. A different subject/message with the same key returns the old record as success. stores/contact-requests.ts sends no idempotency key. createRequestAsTeacher checks that the parent exists, but does not require/validate an active matching tutorRequestId.

Fix: stable key per submit intent reused across retries, scoped to authenticated initiator/operation, with normalized material-payload comparison. A new/different intent must not silently reuse an unrelated pending request. Validate teacher-initiated contact against an eligible active tutor request and matching parent/subject/stage; validate learner-selected teaching offers server-side.

Acceptance: identical lost-response retry returns the original record; changed payload or opposite-direction key reuse conflicts; concurrent duplicate writes resolve consistently; missing/closed/unrelated tutor requests cannot be used for unsolicited offers.

### R6 — Search mode, price, and geographic consistency

Evidence: teachers.controller.js applies geographical restrictions even for online search. Its mode capability condition and price range condition can match different price columns in the same subject row. For example, online=500 and offline=100 can pass online + maxPrice=150. Explicit area selection still expands to the governorate.

Fix: apply the price range to the selected mode/place, use explicit capability flags consistently, do not geographically restrict online discovery by default, and honor explicit location filters. Preserve the documented same-city default for in-person discovery.

Acceptance: the numeric counterexample above is excluded; online results outside the user's area remain discoverable; explicit area selection is honored; nullable negotiated prices follow an explicit display/filter rule.

### R7 — Propagate request failures and refresh accepted contact data

Evidence: stores/contact-requests.ts updateStatus/updateParentStatus swallow errors and update only local status/replyMessage after PATCH, ignoring returned participant contact data. Thus callers cannot reliably distinguish failure, and accepted contact information can remain stale until reload.

Fix: propagate failures and consume the server's sanitized updated record or refetch successfully. Keep write success separate from refresh failure. Do not issue a false success notification.

Acceptance: failed PATCH does not appear successful; accepted contact details become available without manual reload; rejected requests never expose the phone.

### R8 — Pass the actual frontend quality checks

Five current ESLint errors:
- admin/contact-requests/page.tsx:75 — set-state-in-effect.
- admin/teachers/page.tsx:154 — explicit any.
- public/teachers/[id]/page.tsx:46 — set-state-in-effect.
- teacher/profile/page.tsx:579 and 580 — explicit any.

Fix the errors without disabling rules globally. Run lint, typecheck and build separately. Run one browser acceptance pass covering R1–R7, both request directions, AR/EN and a mobile viewport. Preserve test evidence, not just a summary assertion.

## Stop condition and deferred work

Do not restart Z01–Z19 or expand G2 during this pass. Stop after R1–R8 are addressed and their relevant checks pass, reporting any genuinely unavailable external dependency explicitly. If a check reveals another defect that blocks these acceptance criteria, fix it in this pass.

Firebase credentials, a verified support channel, automated recovery provider, actual teacher supply, broader SEO, skills expansion, and marketing operations remain separate dependencies/deferred work. No production deployment, production database mutation, real-user messaging, or fabricated operational claims.

The final handoff should contain: commit, R1–R8 pass/fail, exact test results, and external blockers. No new general implementation report is needed.

## Implementation closeout — 2026-09-26

Continued the existing uncommitted fixes rather than replacing them. Local code now
uses zads.app, header-authenticated certificate previews and server-assigned
certificate ownership, authenticated return paths, stable request retry keys,
full retry-payload comparisons, recipient status response updates, explicit
teaching-mode controls, and mode-consistent search. Tutor browsing's unsupported
schema field and online/location semantics were repaired. Push is explicitly
disabled instead of registering synthetic tokens; no support address is invented.

Validation on the completed changes:
- `pnpm test:local` / `node scripts/test-local.js`: fresh disposable PostgreSQL,
  all eight migrations, and all three HTTP integration suites passed.
- `node node_modules/eslint/bin/eslint.js src --quiet`: passed.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: passed.
- Final Next.js production build: passed after the last frontend changes.
- Browser testing was explicitly declined by the owner and is left for their review.

No production deployment, DNS change, production database operation, or real-user
message was performed. Firebase delivery, a confirmed support channel, and automated
recovery remain external/deferred work. This is a local implementation closeout,
not approval to launch a campaign or a claim that all original G2 work is complete.
