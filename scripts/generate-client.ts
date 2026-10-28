/** Engine-free Prisma client generation. Pinned internal APIs; covered by build checks. */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { getGenerators } =
  require("@prisma/internals") as typeof import("@prisma/internals");
const { PrismaClientJsGenerator } =
  require("@prisma/client-generator-js") as typeof import("@prisma/client-generator-js");
const generators = await getGenerators({
  schemaPath: "prisma/schema.prisma",
  registry: {
    "prisma-client-js": {
      type: "in-process",
      generator: new PrismaClientJsGenerator({ cliCommand: "prisma generate" }),
    },
  },
  skipDownload: true,
  cliCommand: "prisma generate",
});
try {
  for (const generator of generators) await generator.generate();
} finally {
  for (const generator of generators) generator.stop();
}
