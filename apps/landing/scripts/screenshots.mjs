// Screenshots of the website for the repository README (assets/readme/), light and dark.
// Usage, from apps/landing after `npm run build`: `npm run screenshots`. It serves the production
// build on its own port (ports.json) and saves the top of each page listed below as WebP.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { nextStart } from "./bin.mjs";
import { SCREENSHOTS_PORT as PORT } from "./ports.mjs";

const APP = path.resolve(import.meta.dirname, "..");
const OUT = path.resolve(APP, "../../assets/readme");
const BASE = `http://localhost:${PORT}`;

/** name: page and the part of it (from the top) that the picture shows, in CSS pixels. */
const PAGES = {
  "landing-home": { path: "/en", width: 1440, height: 1700 },
  "landing-pricing": { path: "/en/pricing", width: 1440, height: 1700 },
};

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${BASE}/en`)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`no server on ${BASE}`);
}

const server = nextStart(PORT, APP);
mkdirSync(OUT, { recursive: true });
try {
  await waitForServer();
  const browser = await chromium.launch();
  for (const [name, { path: route, width, height }] of Object.entries(PAGES)) {
    for (const scheme of ["light", "dark"]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
      // Load the lazy pictures in the captured part before taking it.
      await page.setViewportSize({ width, height });
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500);
      const png = await page.screenshot({ clip: { x: 0, y: 0, width, height } });
      const file = path.join(OUT, `${name}-${scheme}.webp`);
      await sharp(png).resize({ width: 1200 }).webp({ quality: 80, effort: 6 }).toFile(file);
      console.log("saved", path.relative(process.cwd(), file));
      await context.close();
    }
  }
  await browser.close();
} finally {
  server.kill();
}
