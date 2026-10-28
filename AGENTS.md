# ModuSaaS agent guide

One Next.js App Router modular monolith, Node 24/pnpm, PostgreSQL/Prisma, Better Auth. Reuse the existing isolated checkout; do not create worktrees unless requested.

- Source: app pages/API in src/app; UI/forms/layouts in src/components; feature services/schemas in src/modules; typed brand/presets in src/config; database/HTTP/limits in src/server.
- Add features as vertical slices following Projects. Every private read/write requires server-side authentication and owner/verified organization scope. Members read team projects; admins/owners write. Disabled modules must reject direct API calls.
- Add models/indexes to prisma/schema.prisma, create a migration with Prisma CLI, regenerate client, test isolation. Never reset shared databases or overwrite committed migrations.
- Compose UI with Radix/shadcn primitives and shared tokens. Forms use React Hook Form/Zod/Field; validate again on server. Prefer Server Components for reads; client boundaries for interactivity.
- Keep provider secrets server-only; no NEXT_PUBLIC credentials, private prompt logs, fake provider success or TLS/checksum bypasses. Account deletion cannot orphan owned teams, subscriptions or uploaded files.
- Validate: pnpm lint, pnpm typecheck, pnpm test, pnpm format:check, pnpm build. With isolated PostgreSQL and dev server: pnpm test:integration, pnpm test:e2e. pnpm test:generator builds minimal/standard outputs.
- Setup: pnpm install --frozen-lockfile; pnpm setup; pnpm dev. Engine-free Prisma scripts use pinned internal APIs; upgrade with matching Prisma packages and full checks.
- Record actual outcomes and incomplete work in IMPLEMENTATION_STATUS.md. No npm publication, remote push, live deployment or token-saving claim without authorization/evidence.

See docs/architecture/decisions.md, docs/ai/recipes.md and docs/release-checklist.md.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
