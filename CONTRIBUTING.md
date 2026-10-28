# Contributing

Use Node 24 and pinned pnpm. Follow the README setup, work in the existing checkout, and keep PRs focused. Add authorization tests for new private data paths. Never commit credentials, disable TLS/checksum verification, remove failing tests, or claim unverified provider behavior.

Before a PR: pnpm lint, pnpm typecheck, pnpm test, pnpm format:check and pnpm build. Run the integration/E2E suites against an isolated database for behavioral changes. Include migration/deployment impact and verification evidence. Contributions are provided under MIT. See docs/ai/recipes.md for source maps and templates.
