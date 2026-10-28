import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const portFlag = process.argv.indexOf("--port");
if (portFlag >= 0) {
  const port = Number(process.argv[portFlag + 1]);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("Invalid port");
  process.env.PORT = String(port);
}
process.env.HOSTNAME = process.env.APP_HOST ?? "0.0.0.0";
await import(pathToFileURL(resolve(".next/standalone/server.js")).href);
