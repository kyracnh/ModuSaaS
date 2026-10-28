import { readFile } from "node:fs/promises";
import { z } from "zod";
const run = z.object({
  scenario: z.enum(["empty", "starter"]),
  model: z.string().min(1),
  toolSetup: z.string().min(1),
  task: z.string().min(1),
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  seconds: z.number().nonnegative(),
  manualChanges: z.number().int().nonnegative(),
  testsPassed: z.boolean(),
});
const path = process.argv[2];
if (!path)
  throw new Error(
    "Usage: pnpm benchmark <results.json>. See docs/ai/benchmark.md; there are no measured results yet.",
  );
const records = z
  .array(run)
  .min(2)
  .parse(JSON.parse(await readFile(path, "utf8")));
const pairs = new Map<string, typeof records>();
for (const r of records) {
  const key = JSON.stringify([r.model, r.toolSetup, r.task]);
  pairs.set(key, [...(pairs.get(key) ?? []), r]);
}
for (const [key, values] of pairs) {
  const empty = values.filter((v) => v.scenario === "empty"),
    starter = values.filter((v) => v.scenario === "starter");
  if (!empty.length || !starter.length)
    throw new Error(
      "Each comparison requires both scenarios with identical model, tools, and task",
    );
  if (values.some((v) => !v.testsPassed))
    throw new Error("Do not compare incomplete or failing runs");
  const mean = (rs: typeof records) =>
    rs.reduce((a, r) => a + r.inputTokens + r.outputTokens, 0) / rs.length;
  const a = mean(empty),
    b = mean(starter);
  if (a === 0) throw new Error("Baseline tokens must exceed zero");
  console.log(
    JSON.stringify({
      comparison: JSON.parse(key),
      baselineMeanTokens: a,
      starterMeanTokens: b,
      reductionPercent: (1 - b / a) * 100,
      baselineRuns: empty.length,
      starterRuns: starter.length,
    }),
  );
}
