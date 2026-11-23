// Lighthouse CI for every page in both languages, mobile and desktop, median of 3 runs of
// `next start`, all four category scores must be 100.
//
//   npm run lighthouse -w @hybrid-rag/landing                 # builds nothing: run `npm run build` first
//   npm run lighthouse -w @hybrid-rag/landing -- mobile       # one form factor
//   LIGHTHOUSE_URL=/en npm run lighthouse -w @hybrid-rag/landing -- desktop   # one page (a path or a list, comma separated)
//   LIGHTHOUSE_RUNS=1 ...                                     # fewer runs while iterating
//
// Chrome: CHROME_PATH if set, else the Chromium that Playwright installed
// (`npx playwright install chromium`). The pages come from lighthouse/pages.json, which a test
// keeps equal to src/lib/routes.ts.
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { E2E_PORT as PORT } from "./ports.mjs";

const root = path.resolve(import.meta.dirname, "..");
const pages = process.env.LIGHTHOUSE_URL
  ? process.env.LIGHTHOUSE_URL.split(",")
  : JSON.parse(readFileSync(path.join(root, "lighthouse/pages.json"), "utf8"));
const runs = Number(process.env.LIGHTHOUSE_RUNS ?? 3);
const modes = process.argv.slice(2).filter((a) => a === "mobile" || a === "desktop");
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

process.env.CHROME_PATH ||= chromium.executablePath();

function config(mode, outputDir) {
  return {
    ci: {
      collect: {
        url: pages.map((p) => `http://localhost:${PORT}${p}`),
        numberOfRuns: runs,
        startServerCommand: `npx next start -p ${PORT}`,
        startServerReadyPattern: "Ready",
        startServerReadyTimeout: 60000,
        settings: {
          chromeFlags: "--headless=new --no-sandbox",
          ...(mode === "desktop" ? { preset: "desktop" } : {}),
        },
      },
      assert: {
        aggregationMethod: "median-run",
        assertions: Object.fromEntries(CATEGORIES.map((c) => [`categories:${c}`, ["error", { minScore: 1 }]])),
      },
      upload: { target: "filesystem", outputDir },
    },
  };
}

/** Audits that are not a clean pass in the representative run of each URL, informational ones included. */
function summarize(outputDir) {
  const manifest = JSON.parse(readFileSync(path.join(outputDir, "manifest.json"), "utf8"));
  for (const entry of manifest.filter((e) => e.isRepresentativeRun)) {
    const lhr = JSON.parse(readFileSync(path.join(outputDir, path.basename(entry.jsonPath)), "utf8"));
    const scores = CATEGORIES.map((c) => `${c} ${Math.round((lhr.categories[c]?.score ?? 0) * 100)}`).join(", ");
    console.log(`\n${entry.url}\n  ${scores}`);
    const m = lhr.audits;
    console.log(
      `  LCP ${m["largest-contentful-paint"].displayValue}, CLS ${m["cumulative-layout-shift"].displayValue}, TBT ${m["total-blocking-time"].displayValue}`,
    );
    for (const [id, audit] of Object.entries(m)) {
      const mode = audit.scoreDisplayMode;
      if (mode === "notApplicable" || mode === "manual") continue;
      const failing = (mode === "binary" || mode === "numeric") && audit.score !== null && audit.score < 1;
      const items = audit.details?.items?.length ?? 0;
      const informative = (mode === "informative" || mode === "metricSavings") && items > 0 && !(audit.score === 1);
      if (failing || informative) console.log(`  ${failing ? "FAIL" : "info"} ${id}: ${audit.title}${audit.displayValue ? ` (${audit.displayValue})` : ""}`);
    }
  }
}

let failed = false;
for (const mode of modes.length ? modes : ["mobile", "desktop"]) {
  const outputDir = path.join(root, ".lighthouseci", mode);
  mkdirSync(outputDir, { recursive: true });
  const rc = path.join(root, ".lighthouseci", `rc-${mode}.json`);
  writeFileSync(rc, JSON.stringify(config(mode, outputDir), null, 2));
  console.log(`\n=== Lighthouse ${mode}, ${pages.length} pages, ${runs} runs each ===`);
  const result = spawnSync("npx", ["lhci", "autorun", `--config=${rc}`], { cwd: root, stdio: "inherit" });
  if (result.status !== 0) failed = true;
  summarize(outputDir);
}
process.exit(failed ? 1 : 0);
