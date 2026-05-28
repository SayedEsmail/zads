# Zads Deployment Guide

This guide covers the fastest free/staging-friendly deployment path for the current monorepo:

- Frontend: `zads-app` on Vercel
- API: `zads-api` on Render
- Database: Neon Postgres
- Domain: `zads.app` from Name.com

Quick links:

| Tool | Link |
| --- | --- |
| Vercel Dashboard | https://vercel.com/dashboard |
| Render Dashboard | https://dashboard.render.com/ |
| Neon Console | https://console.neon.tech/ |
| Name.com Account | https://www.name.com/account |
| GitHub | https://github.com/ |

> Important: this setup is good for staging, demos, and early testing. For real production traffic, upgrade the API to an always-on paid instance and review Vercel/Render plan terms.

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

---

## 3. Deploy API On Render

Open: https://dashboard.render.com/

Create a Render Web Service connected to the GitHub repo.

### Render Settings

| Field | Value |
| --- | --- |
| Root Directory | `zads-api` |
| Runtime | Node |
| Build Command | `pnpm install && pnpm run db:generate` |
| Start Command | `pnpm start` |
| Branch | `main` |

### API Environment Variables

Set these in Render:

```env
DATABASE_URL=your_neon_pooled_url
DIRECT_URL=your_neon_direct_url
JWT_SECRET=generate_a_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://zads.app
```

If using Firebase Admin locally, do not commit the service account JSON. For hosted production, prefer provider-managed secrets or environment-based credentials.

### Run Migrations And Seed

After the first successful Render deploy, open the Render shell or run equivalent deployment commands and execute:

```bash
pnpm run db:migrate:prod
pnpm run db:seed
```

Verify:

```text
https://api.zads.app/health
```

Expected response shape:

```json
{
  "status": "ok",
  "timestamp": "..."
}
```

---

## 4. Deploy Frontend On Vercel

Open: https://vercel.com/dashboard

Import the same GitHub repo into Vercel.

### Vercel Settings

| Field | Value |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | `zads-app` |
| Build Command | `pnpm run build` |
| Install Command | `pnpm install` |
| Branch | `main` |

### Frontend Environment Variables

Set these in Vercel:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.zads.app/api
API_BASE_URL=https://api.zads.app
NEXTAUTH_URL=https://zads.app
NEXTAUTH_SECRET=generate_a_long_random_secret
AUTH_SECRET=same_value_as_NEXTAUTH_SECRET
```

Use the same random value for `NEXTAUTH_SECRET` and `AUTH_SECRET` unless there is a deliberate reason to separate them.

---

## 5. Connect The Domain From Name.com

Open: https://www.name.com/account

### Vercel Domains

Open: https://vercel.com/dashboard

In Vercel, add:

```text
zads.app
www.zads.app
```

Vercel will show the exact DNS records required. Add those records in Name.com DNS.

### Render API Domain

Open: https://dashboard.render.com/

In Render, add custom domain:

```text
api.zads.app
```

Render will show a CNAME target. Add it in Name.com DNS.

### DNS Checklist

In Name.com, configure records according to the exact provider instructions:

| Host | Provider | Purpose |
| --- | --- | --- |
| `@` | Vercel | Apex web app |
| `www` | Vercel | WWW web app |
| `api` | Render | Express API |

DNS can take a few minutes to several hours to fully propagate.

---

## 6. Production Checks

After DNS and deploys are ready, verify:

```text
https://zads.app
https://www.zads.app
https://api.zads.app/health
```

Then test:

1. Public landing page loads.
2. Login page loads at `/ar/auth/login` and `/en/auth/login`.
3. Seed accounts can log in.
4. API calls succeed from the browser with no CORS errors.
5. Admin, teacher, and client dashboards route correctly.
6. Uploaded images render only if production storage has been configured.

---

## 7. Known Free-Tier Limits

- Vercel Hobby is intended for personal/non-commercial usage.
- Render free web services can spin down after inactivity, causing cold starts.
- Render free local filesystem is not a reliable place for permanent uploads.
- Neon Free is excellent for staging and light usage, but monitor compute/storage limits.

For production, consider:

1. Upgrade Render API to an always-on paid instance.
2. Use Cloudinary, Firebase Storage, S3, or similar for uploads.
3. Upgrade Vercel if the project is commercial or exceeds Hobby limits.
4. Keep Neon usage monitored and upgrade when traffic becomes consistent.

---

## 8. Security Checklist

Before production:

- Rotate/revoke any Firebase service account key that was ever committed to Git history.
- Keep `zads-api/serviceAccountKey.json` untracked and ignored.
- Use strong unique values for `JWT_SECRET`, `NEXTAUTH_SECRET`, and `AUTH_SECRET`.
- Do not expose `.env` files or real credentials in Git.
- Restrict `CORS_ORIGIN` to the deployed web app domain.
- Run migrations with `pnpm run db:migrate:prod`, not `db push`, in production.

---

## 9. Useful Local Verification Commands

From `zads-api`:

```bash
pnpm run db:generate
npx prisma validate
pnpm run db:migrate:prod
```

From `zads-app`:

```bash
pnpm run lint
pnpm run build
```
