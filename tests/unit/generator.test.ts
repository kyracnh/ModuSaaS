import { it, expect, afterEach } from "vitest";
import { mkdtemp, rm, readFile, symlink, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generate } from "../../tooling/create-saas/index";
const roots: string[] = [];
afterEach(async () => {
  for (const r of roots.splice(0))
    await rm(r, { recursive: true, force: true });
});
it("generates an honest branded preset without secrets or generated artifacts", async () => {
  const root = await mkdtemp(join(tmpdir(), "modusaas-gen-"));
  roots.push(root);
  const target = join(root, "app");
  await generate({
    target,
    name: "My Product",
    packageName: "my-product",
    preset: "minimal",
    database: "local",
    deployment: "node",
    auth: "email-password",
  });
  expect(
    JSON.parse(await readFile(join(target, "package.json"), "utf8")).name,
  ).toBe("my-product");
  expect(await readFile(join(target, "src/config/app.ts"), "utf8")).toContain(
    '?? "minimal"',
  );
  await expect(readFile(join(target, ".env"))).rejects.toThrow();
  await expect(
    readFile(join(target, "src/generated/prisma/client.js")),
  ).rejects.toThrow();
  expect(await readFile(join(target, "START_HERE.md"), "utf8")).toContain(
    "retained",
  );
});
it("refuses existing paths and invalid package names", async () => {
  const root = await mkdtemp(join(tmpdir(), "modusaas-gen-"));
  roots.push(root);
  const options = {
    target: root,
    name: "App",
    packageName: "my-app",
    preset: "standard" as const,
    database: "local" as const,
    deployment: "node" as const,
    auth: "email-password" as const,
  };
  await expect(generate(options)).rejects.toThrow("exists");
  await expect(
    generate({
      ...options,
      target: join(root, "new"),
      packageName: "../escape",
    }),
  ).rejects.toThrow("Package");
});
it("rejects source-nested targets even through a symlinked parent", async () => {
  const root = await mkdtemp(join(tmpdir(), "modusaas-gen-"));
  roots.push(root);
  await mkdir(join(root, "parent"));
  await symlink(process.cwd(), join(root, "parent", "source"));
  await expect(
    generate({
      target: join(root, "parent", "source", "forbidden-output"),
      name: "App",
      packageName: "my-app",
      preset: "minimal",
      database: "local",
      deployment: "node",
      auth: "email-password",
    }),
  ).rejects.toThrow("outside");
});
