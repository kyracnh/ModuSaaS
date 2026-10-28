import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { generate } from "../tooling/create-saas/index";
const root = await mkdtemp(join(tmpdir(), "modusaas-preset-builds-"));
try {
  for (const preset of ["minimal", "standard"] as const) {
    const cwd = join(root, preset);
    await generate({
      target: cwd,
      name: "Generated " + preset,
      packageName: "generated-" + preset,
      preset,
      database: "local",
      deployment: "node",
      auth: "email-password",
    });
    for (const args of [
      ["install", "--frozen-lockfile"],
      ["typecheck"],
      ["build"],
    ]) {
      console.log(preset, args.join(" "));
      const result = spawnSync("pnpm", args, {
        cwd,
        stdio: "inherit",
        env: {
          ...process.env,
          NEXT_PUBLIC_PRESET: preset,
          NEXT_TELEMETRY_DISABLED: "1",
        },
      });
      if (result.status !== 0)
        throw new Error(preset + " " + args.join(" ") + " failed");
    }
    const routes = JSON.parse(
      await readFile(join(cwd, ".next/server/app-paths-manifest.json"), "utf8"),
    );
    if (!routes["/dashboard/page"])
      throw new Error("Generated dashboard missing");
    console.log(preset + " install, types and build passed");
  }
} finally {
  await rm(root, { recursive: true, force: true });
}
