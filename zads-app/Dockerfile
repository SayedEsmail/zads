# syntax=docker/dockerfile:1
# Zads web app image for local `docker compose up`. No secrets are baked in:
# API_BASE_URL comes from compose and AUTH_SECRET is generated at start if unset.

FROM node:20-bookworm-slim AS base
RUN npm install -g pnpm@9.15.9
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Public URL used for canonical/OG links at build time.
ARG NEXT_PUBLIC_APP_URL=http://localhost:3001
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN pnpm run build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
# next start writes its image cache under .next/cache.
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json /app/next.config.ts ./
USER node
EXPOSE 3001
CMD ["sh", "-c", "export AUTH_SECRET=\"${AUTH_SECRET:-$(node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\")}\" && export NEXTAUTH_SECRET=\"${NEXTAUTH_SECRET:-$AUTH_SECRET}\" && exec node node_modules/next/dist/bin/next start -H 0.0.0.0 -p 3001"]
