# Implementation status

Updated 2026-10-28. **Working engineering preview; the complete master-prompt scope and public-release acceptance are not finished.** Nothing has been pushed, deployed publicly, published to npm, or claimed to save a measured percentage of tokens.

## Implemented

| Area                | Current implementation                                                                                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Foundation          | Next.js 16 modular monolith, React 19, strict TypeScript, Node 24 LTS, pinned pnpm/lockfile, typed branding/presets and validated server environment                                                                                                               |
| Database            | PostgreSQL 17, Prisma 7, committed initial/preferences migrations, repeatable setup, explicit non-credential seed check, engine-free generation/migrations using pinned official npm tooling                                                                       |
| Authentication      | Better Auth email/password, sessions/logout, protected pages/APIs, SMTP verification/reset with expiring tokens, profile/password settings, guarded account deletion; optional Google/GitHub server providers                                                      |
| Resources           | Persistent Projects CRUD, server validation, search/sort/filter/pagination, per-user limits serialized in PostgreSQL, owner/organization isolation                                                                                                                 |
| Teams               | Optional creation/switching/rename, invitation delivery/acceptance, member removal, owner/admin/member resource permissions; individual mode remains available                                                                                                     |
| UI/forms            | Branded marketing/auth/dashboard layouts, dark/light modes, Radix mobile drawer/dialogs, upstream shadcn Field, RHF/Zod auth/CRUD/contact/preferences forms, profile/password/workspace/invitation/billing/upload forms, development gallery, reusable table/chart |
| Email/notifications | Real SMTP transport and React Email rendering; verification/reset/invitation templates; database notifications and private persistent preferences; authenticated contact delivery when configured                                                                  |
| Billing             | Optional Stripe checkout/portal, server-selected prices, signature validation, transactional replay protection and canonical subscription rereads for out-of-order events; individual plan entitlements                                                            |
| AI                  | Optional OpenAI/Anthropic/Google AI SDK factories; text/streaming/structured/read-only-tool routes; private conversations, bounded context/output, database request reservations, observed token usage, configurable cost estimates and cancellation               |
| Files               | Private local/S3 adapters; bounded streaming upload reads, MIME/signature checks, authenticated attachment downloads and deletion                                                                                                                                  |
| Distribution        | Local branded preset generator with safe target handling; Minimal/Standard build tests; CI, MIT license/notices, contribution/security docs, agent recipes, benchmark methodology and reporter                                                                     |
| Deployment          | Multistage non-root standalone image; production/dev Compose definitions, persistent PostgreSQL/uploads, optional infrastructure profiles; working standalone Node build/start helpers                                                                             |

## Verification actually performed

- Frozen dependency installation and exact saved environment install script: passed, including repeat setup with no pending migration.
- `pnpm typecheck`: passed.
- `pnpm lint`: passed with one warning: TanStack Table v8 is incompatible with future automatic React Compiler memoization. React Compiler is not enabled; the component explicitly opts out. No lint errors.
- `pnpm test`: **10 passed** (validation, upload boundaries, origin checks, roles, generator safety).
- `pnpm test:integration`: **15 passed** (real HTTP/PostgreSQL auth/CRUD/isolation/limits; Stripe controlled signature/replay fixtures; AI quota reservations and actual SDK structured/streaming routes with the SDK's official controlled model fixture).
- `pnpm test:e2e`: **4 passed**, Chromium desktop and mobile; registration, guest/wrong-password protection, persistent create/edit, profile update, drawer/theme navigation, account deletion. Real dashboard screenshot: `docs/images/dashboard.png`.
- `pnpm test:email`: **6 groups passed** with real local Mailpit SMTP: verification/login, password reset/token replay, team invitation/removal authorization, private uploads, unconfigured-provider/input handling, preference isolation.
- `pnpm test:generator`: Minimal and Standard independently installed, typechecked and production-built. Generated projects intentionally retain optional files/dependencies; no pruning claim.
- Production `pnpm build`: passed after clearing a failed sandbox-generated Turbopack cache. Normal builds need local worker socket permissions in this managed environment.
- Production `pnpm start`: standalone HTML, static JS, DB health, unauthorized APIs and protected-page redirects passed.
- Production Docker image: built successfully with TLS verification and a temporary BuildKit CA mount; no session CA baked into layers.
- Production Compose: migrations completed, non-root app/database health passed; real registration/CRUD passed; persisted project and authenticated session survived database/application restarts; account deletion revoked the session.
- `pnpm size`: 29 JavaScript chunks, **467,567 aggregate gzip bytes**, largest **143,772 bytes**, within the 3 MiB aggregate/400 KiB chunk budgets. This is an aggregate build metric, not a per-page download or performance improvement claim.
- `pnpm audit --prod --audit-level high`: passed; **one low-severity advisory** remains in transitive `deepmerge` via React Email/html-to-text (GHSA-gcqx-w48m-w2h4; no published patch at inspection). User-controlled merge options are not accepted by the application.
- Dependency license inventory generated from the production dependency tree; non-MIT dependencies retain their own terms. Release review must verify distributable notices/source obligations for LGPL/MPL/EPL/CC-BY dependencies.
- `pnpm format:check` and `git diff --check`: passed.

## Partial or unimplemented master-prompt requirements

- The entire requested component catalog is not implemented: advanced combobox/command/OTP/date-time/resizable patterns, a complete layout/form gallery, desktop sidebar collapse, user dropdown and exhaustive accessibility audits remain. Current gallery examples are functional and use clearly labeled example data.
- Team role/ownership-transfer/organization-deletion settings UI and exhaustive invitation-expiration/last-owner tests remain; maintained Better Auth APIs enforce their backend rules. Teams use the free resource limit; paid team billing is not implemented.
- Live Stripe checkout/payment/portal/cancellation, provider-backed AI calls and private S3 interoperability have **not** been tested; real provider settings are absent. Controlled fixtures are not live-provider evidence.
- Stripe simultaneous checkout sessions still need stronger duplicate-subscription prevention. Trial policy is provider-managed; no local trial editor. No fully generalized provider-independent entitlements/usage ledger.
- AI quotas count daily requests, not hard tokens/spend. Aborted usage may be unknown; process crashes leave reservations. No provider reconciliation, true regenerate/branching, selectable model allowlist, embeddings/RAG, or sensitive action tools.
- Dedicated welcome/billing email templates and automated preference-driven campaigns remain. Stored preferences do not schedule email.
- OAuth UI, magic links, and two-factor UI are not implemented. Only English copy is provided.
- Generator independently guided module choices and actual optional dependency/file pruning remain; presets currently select runtime gates. No npm publication.
- Dev Compose app startup and optional Redis/MinIO profiles have not been independently exercised as full stacks; the default database, host development application and production Compose stack were exercised. Local upload persistence across container recreation, S3 durability and backup restoration remain release checks.
- Analytics, error tracking, background jobs, cache/search providers, automated retention/orphan cleanup and complete security/accessibility audits remain extension work.
- GitHub-hosted CI, remote deployment, other OS/platforms and benchmark experiments have not been executed. A workflow file and reproducible methodology are provided.

## Environment and next priorities

Reusable `install_script` and `start_skill` were saved to the environment draft and the install script was executed successfully. Review/save and publish in environment settings to activate a snapshot; draft saving is not publication. Native Prisma CLI access remains an optional network-settings change; current engine-free setup does not require it. All original package-manager network presets were preserved.

Repeated VFS Docker builds exhausted the 32 GB root disk once; only task-created obsolete images/build cache were reclaimed. PostgreSQL volumes and repository files were preserved. Local production test stacks were stopped after verification; their volumes were preserved. No live provider credentials were requested or fabricated.

Next priorities: finish the remaining UI/generator scope; close billing concurrency and retention/deletion gaps; verify real providers in test accounts; exercise remaining deployment/backup scenarios; complete the release checklist in `docs/release-checklist.md`. Keep this an engineering preview until those gates are satisfied.
