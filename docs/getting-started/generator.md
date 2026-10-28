# Local scaffold generator

Run `pnpm create-saas ../new-app --name "New App" --package new-app --preset standard --deployment node --database local --auth email-password` from the source checkout. Without flags in an interactive terminal, answer the prompts. Existing target paths, nested source targets and invalid package names/presets are refused. A failed generation removes only the new directory it created. Symlink-target safety is covered by generator tests; never point it at a user-owned existing directory.

The generator copies a deterministic allowlist of templates excluding secrets, Git metadata, caches and generated Prisma files. It customizes package name, typed brand/preset and .env.example. Local/managed database and deployment preferences appear in START_HERE.md. Email/password is always enabled; OAuth is configured later. Presets determine optional organizations, billing/AI/storage together; arbitrary independent module choices and dependency pruning are not implemented. All presets retain one lockfile, schema and provider source. Nothing is published to npm.

Generated project checks install with the frozen lockfile, generate Prisma, typecheck and build minimal/standard separately. Runtime integration tests require a separate PostgreSQL and correctly configured environment. Distribution remains an engineering preview until all release-checklist gates pass.
