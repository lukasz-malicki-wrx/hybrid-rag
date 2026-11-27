/**
 * hybrid-rag design file generator (Figma plugin entry).
 *
 * Order matters: fonts, variables and styles first (everything binds to them), then icons, then
 * the components (core first: landing and app components are made of core ones), then screens,
 * which only use instances.
 */
import { loadFonts, setupStyles } from "./lib/styles.js";
import { setupVariables, T } from "./lib/tokens.js";
import { setupIcons } from "./lib/icons.js";
import { flushEffects } from "./lib/layout.js";
import { setDocTarget } from "./lib/components.js";
import { board, placer, setupPages } from "./lib/pages.js";
import { buildFoundations } from "./foundations.js";
import { buildCoreComponents } from "./components/core.js";
import { buildLandingComponents } from "./components/landing.js";
import { buildAppComponents } from "./components/app.js";
import { buildLandingScreens } from "./screens/landing/index.js";
import { buildAppScreens } from "./screens/app/index.js";

async function step(label, fn) {
  figma.notify(label, { timeout: 1500 });
  try {
    return await fn();
  } catch (e) {
    throw new Error(`${label}: ${e && e.message ? e.message : e}`);
  }
}

async function run() {
  const pages = await step("Loading Inter", async () => {
    await loadFonts();
    return setupPages();
  });
  await step("Variables", setupVariables);
  await step("Styles", setupStyles);

  await figma.setCurrentPageAsync(pages.ds);
  const placeDs = placer(pages.ds, 240);
  await step("Icons", setupIcons);
  await step("Foundations", () => buildFoundations(pages.ds, placeDs));

  const boards = {};
  for (const [key, title, desc] of [
    ["core", "Components · Core", "packages/ui: the building blocks shared by the app and the landing page."],
    ["landing", "Components · Landing", "apps/landing/src/components: sections and parts of the website."],
    ["app", "Components · App", "apps/web/src/features: the parts of the chat application."],
  ]) {
    const { board: b, body } = await board(title, desc, { width: 3200 });
    placeDs(b);
    boards[key] = { board: b, body };
  }

  setDocTarget(boards.core.body);
  await step("Core components", () => buildCoreComponents());
  setDocTarget(boards.landing.body);
  await step("Landing components", () => buildLandingComponents());
  setDocTarget(boards.app.body);
  await step("App components", () => buildAppComponents());
  setDocTarget(null);
  // Boards grew while components were added: stack them again.
  let y = boards.core.board.y;
  for (const key of ["core", "landing", "app"]) {
    boards[key].board.y = y;
    y += boards[key].board.height + 240;
  }

  await figma.setCurrentPageAsync(pages.landing);
  await step("Landing screens", () => buildLandingScreens(pages.landing, placer(pages.landing, 240)));
  await figma.setCurrentPageAsync(pages.app);
  await step("App screens", () => buildAppScreens(pages.app, placer(pages.app, 240)));

  await step("Shadows", flushEffects);
  await figma.setCurrentPageAsync(pages.ds);
  figma.viewport.scrollAndZoomIntoView(pages.ds.children.slice(0, 1));
  const how = T.strategy === "modes" ? "Light/Dark as variable modes" : "Light/Dark as two Theme collections (one mode per collection on this plan)";
  figma.closePlugin(`hybrid-rag design built: ${how}.`);
}

run().catch(async (e) => {
  const message = e && e.message ? e.message : String(e);
  console.error("[hybrid-rag] failed:", message, e && e.stack);
  // Leave the error on the canvas too: the closing toast disappears after a few seconds.
  try {
    const page = figma.root.children[0];
    await figma.setCurrentPageAsync(page);
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    const t = figma.createText();
    t.characters = `hybrid-rag generator failed:\n${message}`;
    t.fontSize = 32;
    t.fills = [{ type: "SOLID", color: { r: 0.8, g: 0.1, b: 0.1 } }];
    t.name = "Generator error";
    page.appendChild(t);
    t.x = -2000;
    t.y = 0;
    figma.viewport.scrollAndZoomIntoView([t]);
  } catch (ignored) {
    // the toast still says it
  }
  figma.closePlugin(`Error: ${message}`);
});
