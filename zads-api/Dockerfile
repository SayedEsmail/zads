# syntax=docker/dockerfile:1
# Zads API image for local `docker compose up`. No secrets are baked in:
# DATABASE_URL comes from compose and JWT_SECRET is generated at start if unset.

FROM node:20-bookworm-slim AS base
# Prisma's query engine needs OpenSSL.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@9.15.9
WORKDIR /app

# Dependencies from the lockfile; postinstall runs `prisma generate`, so the
# schema has to be present. Dev dependencies stay: `prisma migrate deploy`
# needs the prisma CLI at start-up.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

FROM base AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
COPY scripts ./scripts
COPY src ./src
# Uploads are written at runtime; give the unprivileged user that directory only.
RUN mkdir -p public/uploads && chown -R node:node public
USER node
EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=3s --start-period=20s --retries=20 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# Migrate, seed reference data only on an empty database, then serve.
CMD ["sh", "-c", "export JWT_SECRET=\"${JWT_SECRET:-$(node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\")}\" && node node_modules/prisma/build/index.js migrate deploy && node scripts/seed-if-empty.js && exec node src/app.js"]
