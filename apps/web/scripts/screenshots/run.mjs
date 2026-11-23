// Screenshots of the app for the landing page (apps/landing/public/screenshots) and the README.
// Usage, from apps/web: `npm run screenshots`. It builds the app against a fake API path, serves it,
// answers the API with the demo data in data.mjs (no backend, model or private data involved) and
// saves every picture of apps/landing/src/config/screenshots.ts in the light and the dark theme,
// at twice the listed size, as WebP.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import * as data from "./data.mjs";

const PORT = 3110;
const BASE = `http://localhost:${PORT}`;
const MOCK = "/mock-api";
const APP = path.resolve(import.meta.dirname, "../..");
const OUT = path.resolve(APP, "../landing/public/screenshots");
const SCALE = 2;

/** id: viewport, route, and what to do before the picture is taken. */
const SHOTS = {
  "hero-chat": { size: [1080, 956], path: "/c/c1" },
  "about-sources": { size: [1080, 906], path: "/c/c1", before: openSource(2) },
  "how-flow": { size: [1080, 956], path: "/c/c2" },
  chat: { size: [1440, 900], path: "/c/c1" },
  sources: { size: [1440, 900], path: "/c/c1", before: openSource(2) },
  start: { size: [1440, 900], path: "/" },
  groups: { size: [1440, 900], path: "/g/g1" },
  document: { size: [1440, 900], path: "/d/d1" },
  "search-lab": { size: [1440, 900], path: "/search", before: search },
  "mobile-chat": { size: [390, 844], path: "/c/c1", mobile: true },
  settings: { size: [1440, 900], path: "/", before: openSettings },
};

function openSource(n) {
  return async (page) => {
    const name = new RegExp(`^Source ${n}:`);
    await page.getByRole("list", { name: "Messages" }).getByRole("button", { name }).last().click();
    await page.getByRole("complementary", { name: "Sources" }).waitFor();
  };
}

async function search(page) {
  await page.getByRole("textbox", { name: "Question" }).fill(data.searchQuestion);
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByText(/results?$/).first().waitFor();
}

async function openSettings(page) {
  await page.getByRole("complementary", { name: "Sidebar" }).getByRole("button", { name: "Settings" }).click();
  await page.getByRole("dialog", { name: "Settings" }).waitFor();
}

const json = (route, body, status = 200) =>
  route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

async function serveApi(page) {
  await page.route(`**${MOCK}/**`, (route) => {
    const url = new URL(route.request().url());
    const p = url.pathname.slice(MOCK.length);
    const groupId = url.searchParams.get("group_id");
    if (p === "/groups") return json(route, [data.group]);
    if (p === "/groups/g1") return json(route, data.group);
    if (p === "/conversations") {
      const favourites = url.searchParams.get("favorites") === "true";
      return json(route, data.conversations.filter((c) => (!favourites || c.favorite) && (!groupId || c.group_id === groupId)));
    }
    const conversation = /^\/conversations\/(\w+)$/.exec(p);
    if (conversation) return json(route, data.details[conversation[1]] ?? { ...data.details.c1, id: conversation[1] });
    if (p === "/documents") return json(route, groupId ? data.groupDocuments : data.documents);
    if (p === "/documents/d1") return json(route, data.documents[0]);
    if (p === "/documents/d1/chunks") return json(route, data.chunks);
    if (p === "/search") return json(route, data.searchHits);
    if (p === "/settings") return json(route, data.settings);
    return json(route, { detail: "not in the demo data" }, 404);
  });
}

function run(command, args, env) {
  const result = spawnSync(command, args, { cwd: APP, stdio: "inherit", env: { ...process.env, ...env } });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed`);
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`no server on ${BASE}`);
}

const env = { NEXT_PUBLIC_API_URL: `${BASE}${MOCK}`, NEXT_TELEMETRY_DISABLED: "1" };
run("npm", ["run", "build"], env);
const server = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: APP, env: { ...process.env, ...env }, stdio: "ignore" });
mkdirSync(OUT, { recursive: true });

try {
  await waitForServer();
  const browser = await chromium.launch();
  for (const [id, shot] of Object.entries(SHOTS)) {
    for (const scheme of ["light", "dark"]) {
      const [width, height] = shot.size;
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: SCALE,
        colorScheme: scheme,
        reducedMotion: "reduce",
        locale: "en-GB",
        timezoneId: "Europe/Warsaw",
        isMobile: shot.mobile ?? false,
        hasTouch: shot.mobile ?? false,
      });
      const page = await context.newPage();
      await serveApi(page);
      await page.goto(`${BASE}${shot.path}`);
      await page.waitForLoadState("networkidle");
      if (shot.before) await shot.before(page);
      await page.waitForTimeout(400);
      const png = await page.screenshot();
      const file = path.join(OUT, `${id}-${scheme}.webp`);
      await sharp(png).webp({ quality: 82, effort: 6 }).toFile(file);
      console.log("saved", path.relative(process.cwd(), file));
      await context.close();
    }
  }
  await browser.close();
} finally {
  server.kill();
}
