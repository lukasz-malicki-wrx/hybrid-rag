// Runs `next dev` or `next start` on the app's port (ports.json, or LANDING_PORT).
//   node scripts/next.mjs dev | start
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { DEV_PORT } from "./ports.mjs";

const command = process.argv[2];
if (command !== "dev" && command !== "start") {
  console.error("usage: node scripts/next.mjs dev|start");
  process.exit(2);
}
const next = createRequire(import.meta.url).resolve("next/dist/bin/next");
const child = spawn(process.execPath, [next, command, "-p", String(DEV_PORT)], { stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 1));
