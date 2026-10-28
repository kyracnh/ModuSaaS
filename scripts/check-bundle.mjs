import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
async function files(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await files(path)));
    else if (entry.name.endsWith(".js")) result.push(path);
  }
  return result;
}
const chunks = await Promise.all(
  (await files(".next/static/chunks")).map(async (path) => ({
    path,
    bytes: gzipSync(await readFile(path)).byteLength,
  })),
);
const total = chunks.reduce((sum, chunk) => sum + chunk.bytes, 0);
const largest = chunks.reduce(
  (max, chunk) => (chunk.bytes > max.bytes ? chunk : max),
  { path: "", bytes: 0 },
);
console.log(
  JSON.stringify(
    {
      javascriptChunks: chunks.length,
      totalGzipBytes: total,
      largestChunk: largest,
      totalBudgetBytes: 3 * 1024 * 1024,
      chunkBudgetBytes: 400 * 1024,
    },
    null,
    2,
  ),
);
if (total > 3 * 1024 * 1024 || largest.bytes > 400 * 1024)
  throw new Error(
    "Browser JavaScript budget exceeded. Inspect optional client imports before changing the budget.",
  );
