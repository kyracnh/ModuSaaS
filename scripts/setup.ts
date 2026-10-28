import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import dotenv from "dotenv";
import { envSchema } from "../src/config/env";
if (!existsSync(".env")) {
  const template = readFileSync(".env.example", "utf8");
  writeFileSync(
    ".env",
    template.replace(
      /^BETTER_AUTH_SECRET=.*$/m,
      "BETTER_AUTH_SECRET=" + randomBytes(48).toString("base64url"),
    ),
    { mode: 0o600 },
  );
  console.log("Created local .env. Review DATABASE_URL before continuing.");
}
dotenv.config({ quiet: true });
if (!process.env.BETTER_AUTH_SECRET) {
  const secret = randomBytes(48).toString("base64url");
  let content = readFileSync(".env", "utf8");
  content = content.replace(
    /^BETTER_AUTH_SECRET=.*$/m,
    "BETTER_AUTH_SECRET=" + secret,
  );
  writeFileSync(".env", content, { mode: 0o600 });
  process.env.BETTER_AUTH_SECRET = secret;
}
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    parsed.error.issues
      .map((i) => i.path.join(".") + ": " + i.message)
      .join("\n"),
  );
  process.exit(1);
}
for (const args of [["db:generate"], ["db:migrate"]]) {
  const p = spawnSync("pnpm", args, { stdio: "inherit", env: process.env });
  if (p.status !== 0) {
    console.error(
      "Setup failed. Ensure PostgreSQL is running and DATABASE_URL points to a database you own. For Docker: docker compose -f compose.dev.yml up -d db",
    );
    process.exit(p.status ?? 1);
  }
}
console.log(
  "Ready. Run pnpm dev. Optional: pnpm db:seed (creates no users or credentials).",
);
