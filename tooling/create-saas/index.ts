import {
  cp,
  mkdir,
  readFile,
  writeFile,
  stat,
  rm,
  realpath,
} from "node:fs/promises";
import { resolve, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { presets, type Preset } from "../../src/config/app";
export type Options = {
  target: string;
  name: string;
  packageName: string;
  preset: Preset;
  deployment: "node" | "docker";
  database: "local" | "managed";
  auth: "email-password";
};
export async function generate(options: Options) {
  if (!/^[a-z][a-z0-9-]{1,62}$/.test(options.packageName))
    throw new Error(
      "Package name must be 2–63 lowercase letters, numbers or hyphens, starting with a letter",
    );
  if (
    !options.name.trim() ||
    options.name.length > 80 ||
    /[\x00-\x1f]/.test(options.name)
  )
    throw new Error("Brand name must be 1–80 characters");
  if (!Object.hasOwn(presets, options.preset))
    throw new Error("Supported presets: minimal, standard, full");
  const source = resolve(fileURLToPath(new URL("../..", import.meta.url)));
  const target = resolve(options.target);
  const parent = await realpath(resolve(target, ".."));
  const canonicalTarget = join(parent, relative(resolve(target, ".."), target));
  if (!relative(source, canonicalTarget).startsWith(".."))
    throw new Error("Choose a target outside the source checkout");
  try {
    await stat(target);
    throw new Error("Target already exists. Choose a new directory.");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  await mkdir(target, { recursive: false });
  try {
    const entries = [
      "src",
      "prisma",
      "public",
      "scripts",
      "docs",
      "examples",
      "tests",
      "tooling",
      ".github",
      "package.json",
      "pnpm-lock.yaml",
      "pnpm-workspace.yaml",
      "tsconfig.json",
      "next.config.ts",
      "postcss.config.mjs",
      "eslint.config.mjs",
      "prisma.config.ts",
      "vitest.config.ts",
      "vitest.integration.config.ts",
      "playwright.config.ts",
      ".prettierignore",
      ".gitignore",
      ".node-version",
      ".env.example",
      "Dockerfile",
      ".dockerignore",
      "compose.dev.yml",
      "compose.prod.yml",
      "README.md",
      "AGENTS.md",
      "THIRD_PARTY_NOTICES.md",
      "LICENSE",
      "CONTRIBUTING.md",
      "CODE_OF_CONDUCT.md",
      "SECURITY.md",
      "CHANGELOG.md",
      "IMPLEMENTATION_STATUS.md",
    ];
    for (const entry of entries)
      await cp(join(source, entry), join(target, entry), {
        recursive: true,
        filter: (p) => !p.includes("/src/generated"),
      });
    const pkg = JSON.parse(
      await readFile(join(target, "package.json"), "utf8"),
    );
    pkg.name = options.packageName;
    await writeFile(
      join(target, "package.json"),
      JSON.stringify(pkg, null, 2) + "\n",
    );
    const configPath = join(target, "src/config/app.ts");
    let config = await readFile(configPath, "utf8");
    config = config
      .replace('?? "ModuSaaS"', "?? " + JSON.stringify(options.name))
      .replace('?? "standard"', "?? " + JSON.stringify(options.preset));
    await writeFile(configPath, config);
    const envPath = join(target, ".env.example");
    let env = await readFile(envPath, "utf8");
    env = env
      .replace(
        /^NEXT_PUBLIC_APP_NAME=.*$/m,
        "NEXT_PUBLIC_APP_NAME=" + JSON.stringify(options.name),
      )
      .replace(
        /^NEXT_PUBLIC_PRESET=.*$/m,
        "NEXT_PUBLIC_PRESET=" + options.preset,
      );
    if (options.database === "managed")
      env = env.replace(
        /^DATABASE_URL=.*$/m,
        "DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE",
      );
    await writeFile(envPath, env);
    await writeFile(
      join(target, "START_HERE.md"),
      `# ${options.name}\n\nPreset: ${options.preset}. Deployment: ${options.deployment}. Auth: email/password. Database: ${options.database}.\n\nRun pnpm install --frozen-lockfile, configure PostgreSQL, pnpm setup, then pnpm dev. For Docker, see README.md.\n\nPresets gate routes and UI at runtime. All optional source files and dependencies are retained; no dependency-pruning claim is made.\n`,
    );
  } catch (e) {
    await rm(target, { recursive: true, force: true });
    throw e;
  }
  return target;
}
async function cli() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.log(
      'pnpm create-saas <new-directory> --name "My App" --package my-app --preset minimal|standard|full --deployment node|docker --database local|managed --auth email-password\nWithout flags, an interactive terminal asks for choices. Presets retain all dependencies.',
    );
    return;
  }
  const arg = (flag: string, fallback: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? (args[i + 1] ?? fallback) : fallback;
  };
  let target = args.find((a) => !a.startsWith("-")) ?? "";
  let name = arg("--name", "My SaaS"),
    packageName = arg("--package", "my-saas"),
    preset = arg("--preset", "standard"),
    deployment = arg("--deployment", "node"),
    database = arg("--database", "local");
  if (stdin.isTTY && args.length < 2) {
    const rl = createInterface({ input: stdin, output: stdout });
    try {
      target =
        (await rl.question(
          `Project directory [${target || "../my-saas"}]: `,
        )) ||
        target ||
        "../my-saas";
      name = (await rl.question("Brand name [My SaaS]: ")) || name;
      packageName =
        (await rl.question("Package name [my-saas]: ")) || packageName;
      preset =
        (await rl.question("Preset minimal / standard / full [standard]: ")) ||
        preset;
      deployment =
        (await rl.question("Deployment node / docker [node]: ")) || deployment;
      database =
        (await rl.question("Database local / managed [local]: ")) || database;
      console.log(
        "Email/password auth is always enabled. OAuth is optional after setup. Teams are enabled by standard/full; billing and AI by full. Credentials remain optional.",
      );
    } finally {
      rl.close();
    }
  }
  if (!target) throw new Error("Provide a new target directory. See --help.");
  if (
    !["node", "docker"].includes(deployment) ||
    !["local", "managed"].includes(database) ||
    arg("--auth", "email-password") !== "email-password"
  )
    throw new Error(
      "Unsupported combination. Use node/docker, local/managed PostgreSQL, and email-password auth.",
    );
  const path = await generate({
    target,
    name,
    packageName,
    preset: preset as Preset,
    deployment: deployment as "node" | "docker",
    database: database as "local" | "managed",
    auth: "email-password",
  });
  console.log(
    `Created ${path}. Next: cd there; pnpm install --frozen-lockfile; pnpm setup; pnpm dev. See START_HERE.md.`,
  );
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  cli().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
