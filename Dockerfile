# syntax=docker/dockerfile:1.7
FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN --mount=type=secret,id=proxy_ca \
    if [ -f /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    npm install --global pnpm@11.25.0

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=secret,id=proxy_ca \
    if [ -f /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    pnpm install --frozen-lockfile

FROM dependencies AS tooling
COPY . .
RUN pnpm db:generate
CMD ["pnpm", "db:migrate"]

FROM tooling AS development
CMD ["pnpm", "dev"]

FROM tooling AS builder
ARG NEXT_PUBLIC_APP_NAME=ModuSaaS
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_PRESET=standard
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL NEXT_PUBLIC_PRESET=$NEXT_PUBLIC_PRESET
RUN pnpm build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
RUN mkdir -p /app/.data/uploads && chown -R node:node /app/.data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
