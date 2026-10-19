# Zads Deployment Guide

This guide covers the fastest no-card-friendly deployment path for the current monorepo:

- Frontend: `zads-app` on Vercel
- API: `zads-api` on Vercel as a separate project
- Database: Neon Postgres
- Domain: `zads.app` from Name.com

Quick links:

| Tool | Link |
| --- | --- |
| Vercel Dashboard | https://vercel.com/dashboard |
| Neon Console | https://console.neon.tech/ |
| Name.com Account | https://www.name.com/account |
| GitHub | https://github.com/ |

> Important: this setup is good for staging, demos, and early testing. Vercel serverless functions are not a permanent filesystem, so production uploads should move to Cloudinary, Firebase Storage, S3, or similar.

---

## 1. Target URLs

Use this domain split:

| Service | URL |
| --- | --- |
| Web app | `https://zads.app` |
| Web app www | `https://www.zads.app` |
| API | `https://api.zads.app` |
| API health | `https://api.zads.app/health` |

---

## 2. Neon Postgres

Open: https://console.neon.tech/

1. Create a Neon project.
2. Create/use a database for Zads.
3. Copy both connection strings:
   - Pooled connection string for `DATABASE_URL`
   - Direct/unpooled connection string for `DIRECT_URL`

Use the pooled URL for normal app traffic and the direct URL for Prisma migrations.

Example env shape:

```env
DATABASE_URL="postgresql://...neon.tech/...?..."
DIRECT_URL="postgresql://...neon.tech/...?..."
```

Security note: if a Neon connection string was ever shared in chat, logs, screenshots, or commits, rotate/reset the database password in Neon and update all environments with the new URLs.

---

## 3. Apply Database Migrations

Run migrations from your local machine or a trusted CI environment before deploying the API:

```bash
cd zads-api
pnpm install
pnpm run db:generate
pnpm run db:migrate:prod
pnpm run db:seed
```

Verify migration status:

```bash
npx prisma migrate status
```

Expected result:

```text
Database schema is up to date!
```

---

## 4. Deploy API On Vercel

Open: https://vercel.com/dashboard

Create a new Vercel project from the GitHub repository.

### API Vercel Settings

| Field | Value |
| --- | --- |
| Project name | `zads-api` |
| Framework Preset | Other |
| Root Directory | `zads-api` |
| Install Command | `pnpm install` |
| Build Command | `pnpm run db:generate` |
| Output Directory | Leave empty |
| Branch | `main` |

The API uses [zads-api/vercel.json](./zads-api/vercel.json) to route all requests to `src/app.js` through `@vercel/node`.

### API Environment Variables

Set these in the Vercel API project:

```env
DATABASE_URL=your_neon_pooled_url
DIRECT_URL=your_neon_direct_url
JWT_SECRET=generate_a_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
CORS_ORIGIN=https://zads.app
```

Do not set `PORT` on Vercel. Vercel provides the serverless runtime and does not need the app to bind to a port.

### API Domain

In the API Vercel project, add this custom domain:

```text
api.zads.app
```

Vercel will show the exact DNS records required. Add those records in Name.com DNS.

### API Verification

After deployment and DNS propagation, verify:

```text
https://api.zads.app/health
https://api.zads.app/api/subjects
```

Expected health response shape:

```json
{
  "status": "ok",
  "timestamp": "..."
}
```

---

## 5. Deploy Frontend On Vercel

Open: https://vercel.com/dashboard

Create a second Vercel project from the same GitHub repository.

### Frontend Vercel Settings

| Field | Value |
| --- | --- |
| Project name | `zads-app` |
| Framework Preset | Next.js |
| Root Directory | `zads-app` |
| Install Command | `pnpm install` |
| Build Command | `pnpm run build` |
| Branch | `main` |

### Frontend Environment Variables

Set these in the Vercel frontend project:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.zads.app/api
API_BASE_URL=https://api.zads.app
NEXTAUTH_URL=https://zads.app
NEXTAUTH_SECRET=generate_a_long_random_secret
AUTH_SECRET=same_value_as_NEXTAUTH_SECRET
```

Use the same random value for `NEXTAUTH_SECRET` and `AUTH_SECRET` unless there is a deliberate reason to separate them.

---

## 6. Connect The Domain From Name.com

Open: https://www.name.com/account

### Frontend Domains

In the frontend Vercel project, add:

```text
zads.app
www.zads.app
```

Vercel will show the exact DNS records required. Add those records in Name.com DNS.

### API Domain

In the API Vercel project, add:

```text
api.zads.app
```

Vercel will show the exact DNS records required. Add those records in Name.com DNS.

### DNS Checklist

In Name.com, configure records according to the exact Vercel instructions:

| Host | Provider | Purpose |
| --- | --- | --- |
| `@` | Vercel frontend project | Apex web app |
| `www` | Vercel frontend project | WWW web app |
| `api` | Vercel API project | Express API |

DNS can take a few minutes to several hours to fully propagate.

---

## 7. Production Checks

After DNS and deploys are ready, verify:

```text
https://zads.app
https://www.zads.app
https://api.zads.app/health
https://api.zads.app/api/subjects
```

Then test:

1. Public landing page loads.
2. Login page loads at `/ar/auth/login` and `/en/auth/login`.
3. Seed accounts can log in.
4. API calls succeed from the browser with no CORS errors.
5. Admin, teacher, and client dashboards route correctly.
6. Uploaded images render only if production storage has been configured.

---

## 8. Known Free-Tier Limits

- Vercel Hobby is intended for personal/non-commercial usage.
- Vercel serverless functions are request/response functions, not always-on servers.
- Vercel serverless local filesystem is not a reliable place for permanent uploads.
- Neon Free is excellent for staging and light usage, but monitor compute/storage limits.

For production, consider:

1. Use Cloudinary, Firebase Storage, S3, or similar for uploads.
2. Upgrade Vercel if the project is commercial or exceeds Hobby limits.
3. Keep Neon usage monitored and upgrade when traffic becomes consistent.
4. Consider an always-on API host later if serverless cold starts or timeouts become a problem.

---

## 9. Security Checklist

Before production:

- Rotate/revoke any Firebase service account key that was ever committed to Git history.
- Rotate/reset the Neon password if a connection string was ever exposed.
- Keep `zads-api/serviceAccountKey.json` untracked and ignored; on Vercel provide the key through `FIREBASE_SERVICE_ACCOUNT_JSON` only.
- Use strong unique values for `JWT_SECRET`, `NEXTAUTH_SECRET`, and `AUTH_SECRET`.
- Do not expose `.env` files or real credentials in Git.
- Restrict `CORS_ORIGIN` to the deployed web app domain.
- Run migrations with `pnpm run db:migrate:prod`, not `db push`, in production.

---

## 10. Useful Local Verification Commands

From `zads-api`:

```bash
pnpm run db:generate
npx prisma validate
npx prisma migrate status
pnpm run db:migrate:prod
```

From `zads-app`:

```bash
pnpm run lint
pnpm run build
```
