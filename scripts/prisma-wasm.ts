/** Pinned Prisma engine API for restricted/offline environments. No native download. */
import "dotenv/config";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
const require = createRequire(import.meta.url);
const internalRequire = createRequire(require.resolve("@prisma/internals"));
const enginePath = internalRequire.resolve(
  "@prisma/schema-engine-wasm/schema_engine_bg",
);
const runtime = await import(pathToFileURL(enginePath).href);
const wasm = await WebAssembly.compile(
  await readFile(join(dirname(enginePath), "schema_engine_bg.wasm")),
);
const instance = await WebAssembly.instantiate(wasm, {
  "./schema_engine_bg.js": runtime,
});
runtime.__wbg_set_wasm(instance.exports);
(instance.exports.__wbindgen_start as () => void)();
const adapterRequire = createRequire(require.resolve("@prisma/adapter-pg"));
const { bindMigrationAwareSqlAdapterFactory } = adapterRequire(
  "@prisma/driver-adapter-utils",
);
const datamodel = await readFile("prisma/schema.prisma", "utf8");
const engine = await runtime.SchemaEngine.new(
  { datamodels: [["schema.prisma", datamodel]] },
  () => {},
  bindMigrationAwareSqlAdapterFactory(
    new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  ),
);
const filters = { externalTables: [], externalEnums: [] };
try {
  if (process.argv[2] === "diff") {
    if (existsSync("prisma/migrations/20261028000000_initial/migration.sql"))
      throw new Error(
        "Refusing to overwrite the existing initial migration. Create a new migration instead.",
      );
    const result = await engine.diff({
      from: { tag: "empty" },
      to: {
        tag: "schemaDatamodel",
        files: [{ path: "schema.prisma", content: datamodel }],
      },
      script: true,
      exitCode: false,
      filters,
    });
    await mkdir("prisma/migrations/20261028000000_initial", {
      recursive: true,
    });
    await writeFile(
      "prisma/migrations/20261028000000_initial/migration.sql",
      result.stdout,
    );
    await writeFile(
      "prisma/migrations/migration_lock.toml",
      'provider = "postgresql"\n',
    );
    console.log("Generated initial migration with the Prisma WASM engine.");
  } else {
    const baseDir = join(process.cwd(), "prisma/migrations");
    const dirs = (await readdir(baseDir, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name));
    const migrationDirectories = await Promise.all(
      dirs.map(async (d) => ({
        path: d.name,
        migrationFile: {
          path: "migration.sql",
          content: {
            tag: "ok",
            value: await readFile(
              join(baseDir, d.name, "migration.sql"),
              "utf8",
            ),
          },
        },
      })),
    );
    const result = await engine.applyMigrations({
      migrationsList: {
        baseDir,
        shadowDbInitScript: "",
        lockfile: {
          path: "migration_lock.toml",
          content: await readFile(join(baseDir, "migration_lock.toml"), "utf8"),
        },
        migrationDirectories,
      },
      filters,
    });
    console.log(result);
  }
} finally {
  engine.free();
}
