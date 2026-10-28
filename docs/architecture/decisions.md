# Architecture decisions

- One Next.js App Router application. Server Components read data; Route Handlers serve mutations and integrations. No separate API deployment.
- Node 24 LTS, pnpm, PostgreSQL, Prisma 7 stable (avoid the registry's Prisma 8 prerelease tag), Better Auth with its Prisma adapter. Optional providers remain server-only.
- Every resource query includes an authenticated owner or verified organization scope. Disabled modules reject direct requests.
- Database-backed rate limits and AI reservations coordinate multiple instances without mandatory Redis.
- Configurable branding/presets live in src/config. Provider secrets live in validated server environment only.
- Local PostgreSQL is required; single-application deployment does not embed a database.
- Build phase must not require a live database or third-party keys. Runtime validates required configuration.
- Optional capabilities are implemented incrementally; IMPLEMENTATION_STATUS.md is the source of verification truth.

- The production start command uses Next standalone server output and copies public/static assets during the build; next start is not used with standalone output.
