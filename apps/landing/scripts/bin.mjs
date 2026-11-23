// Programs the scripts start, by absolute path, never looked up in PATH: Node itself runs the
// JavaScript entry points of Next and Lighthouse CI from node_modules.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** The CLI script of Next and of Lighthouse CI, as installed. */
export const NEXT_BIN = require.resolve("next/dist/bin/next");
export const LHCI_BIN = require.resolve("@lhci/cli/src/cli.js");

/** git from the usual system places; GIT_PATH overrides it. */
export const GIT =
  [process.env.GIT_PATH, "/usr/bin/git", "/opt/homebrew/bin/git", "/usr/local/bin/git"].find((p) => p && existsSync(p)) ??
  (() => {
    throw new Error("git not found: set GIT_PATH");
  })();

/** `next start` on a port, in the given folder. */
export function nextStart(port, cwd, stdio = "ignore") {
  return spawn(process.execPath, [NEXT_BIN, "start", "-p", String(port)], { cwd, stdio });
}
