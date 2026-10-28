# Reproducible token-effort benchmark

No measured reduction exists yet. “Up to 95%” is an aspirational reduction in repetitive setup/scaffolding, not an established claim.

Use two clean isolated workspaces with the same model/version, reasoning setting, tool set, machine resources, time limit and task text. Scenario empty starts with no application; scenario starter starts from the same recorded ModuSaaS commit. Do not share generated answers between runs. Run at least five trials per scenario in randomized order.

Task: “Build email/password registration/login, protected dashboard, persistent owner-scoped Notes CRUD with 2–100 character names, search/pagination and profile update. Include PostgreSQL migrations, cross-user authorization tests and a production build.” Use identical acceptance scripts/test assertions in both workspaces. Charge initial starter-reading context, tool results, failed attempts and all retries. Record model/tool configuration, input/output tokens from actual provider/platform usage (not guessed text lengths), wall time, manual edits and test results. Retain transcripts and commit hashes for reproducibility without secrets.

Results JSON is an array of `{scenario: "empty" | "starter", model, toolSetup, task, inputTokens, outputTokens, seconds, manualChanges, testsPassed}`. Run `pnpm benchmark results.json`. It refuses mismatched/incomplete pairs and prints mean token reduction per identical task/setup. Also report medians, spread, time and manual changes; a small selected success case cannot establish general 95% savings. Include setup cost and completion failures separately. There is intentionally no sample “measured” result file.
