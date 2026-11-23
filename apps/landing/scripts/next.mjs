// Runs `next dev` or `next start` on the app's port (ports.json, or LANDING_PORT).
//   node scripts/next.mjs dev | start
import { spawn } from "node:child_process";
import { NEXT_BIN } from "./bin.mjs";
import { DEV_PORT } from "./ports.mjs";

// A fixed string from this table, never the argument itself.
const command = { dev: "dev", start: "start" }[process.argv[2]];
if (!command) {
  console.error("usage: node scripts/next.mjs dev|start");
  process.exit(2);
}
const child = spawn(process.execPath, [NEXT_BIN, command, "-p", String(DEV_PORT)], { stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 1));
