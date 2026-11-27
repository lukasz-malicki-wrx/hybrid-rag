/**
 * Home page: apps/landing/src/app/[locale]/page.tsx and sections/home/*.
 * HomeHero, BuiltWith, Strengths, About (+ Numbers), Gallery, Examples, then the site footer.
 */
import { instance } from "../../lib/components.js";
import { add, frame, size } from "../../lib/layout.js";
import { tl } from "../../lib/text.js";
import { facts } from "../../components/landing/shared.js";
import { layoutSpace } from "../../lib/tokens.js";
import { addInstance, addPara, block, columns, grid, pageFrame, para, section } from "./kit.js";

const BUILT_WITH = [
  ["postgres", "Postgres"],
  ["ollama", "Ollama"],
  ["fastapi", "FastApi"],
  ["next", "NextJs"],
  ["claude", "Claude"],
];

const STRENGTHS = [
  ["checkable", "Check"],
  ["honest", "Unknown"],
  ["local", "Computer"],
  ["twoWays", "Search"],
];

// GALLERY_CARDS (gallery-data.ts): card id, screenshot, area; the area's icon (AREA_ICON in gallery.tsx).
const GALLERY = [
  ["chat", "chat", "chat"],
  ["start", "start", "chat"],
  ["sources", "sources", "sources"],
  ["groups", "groups", "documents"],
  ["document", "document", "quality"],
  ["searchLab", "search-lab", "quality"],
];
const AREA_ICON = { chat: "Chat", sources: "File", documents: "Group", quality: "Check" };

async function builtWith(parent, bp) {
  const { outer, inner } = section(parent, bp, { tone: "panel", name: "Built with", top: bp === "desktop" ? 20 : 40, bottom: "section" });
  const label = await para(tl("home", "builtWith.label"), bp, { size: "lead", muted: true, w: "hug", align: bp === "desktop" ? undefined : "CENTER" });
  const line = frame("Line", { dir: "row", w: 80, h: 1, fill: "fg" });
  const items = BUILT_WITH.map(([id, ic]) => instance("BuiltWithItem", { breakpoint: bp, Label: tl("home", `builtWith.items.${id}`), Icon: ic }));
  if (bp === "desktop") {
    const row = frame("Built with row", { dir: "row", gap: 48, align: "center", w: "fill" });
    add(inner, row);
    const head = frame("Label and line", { dir: "row", gap: 32, align: "center" });
    add(head, label, line);
    add(row, head);
    const list = frame("Parts", { dir: "row", gap: 32, justify: "between", align: "center", w: "fill" });
    add(row, list);
    size(list, "fill");
    for (const i of items) add(list, i);
  } else {
    const col = frame("Built with column", { dir: "col", gap: 24, align: "center", w: "fill" });
    add(inner, col);
    const head = frame("Label and line", { dir: "col", gap: 12, align: "center" });
    add(head, label, line);
    add(col, head);
    grid(col, bp, items, { cols: 2, gap: 8, name: "Parts" });
  }
  return outer;
}

async function strengths(parent, bp) {
  const { inner } = section(parent, bp, { name: "Strengths", align: "center" });
  layoutSpace(inner, "itemSpacing", "heading", bp); // mb-heading
  addInstance(inner, "SectionHeading", { breakpoint: bp, align: "center", level: "2", Eyebrow: tl("home", "strengths.eyebrow"), Title: tl("home", "strengths.title") });
  const cards = STRENGTHS.map(([id, ic]) =>
    instance("FeatureCard", {
      breakpoint: bp,
      background: "surface",
      Title: tl("home", `strengths.items.${id}.title`),
      Text: tl("home", `strengths.items.${id}.text`),
      "Link label": tl("home", `strengths.items.${id}.link`),
      Icon: ic,
    }),
  );
  const g = grid(inner, bp, cards, { cols: bp === "desktop" ? 4 : 1, gap: 20, name: "Strengths" });
  size(g, "fill");
}

async function about(parent, bp) {
  const desktop = bp === "desktop";
  const f = facts();
  const { outer, inner } = section(parent, bp, { tone: "panel", name: "About", top: desktop ? "section" : 0, bottom: desktop ? 120 : 80, outerGap: desktop ? 0 : 40 });
  // The text: heading, the problem, the solution, the link.
  const textCol = frame("Text", { dir: "col", w: "fill" });
  addInstance(textCol, "SectionHeading", { breakpoint: bp, align: "start", level: "2", Eyebrow: tl("home", "about.eyebrow"), Title: tl("home", "about.title"), "Show lead": false }, { fill: true });
  const problem = block(textCol, bp, 40, { name: "Problem" });
  addInstance(problem, "AccentParagraph", { breakpoint: bp, Lead: tl("home", "about.problem") }, { fill: true });
  const solution = block(textCol, bp, 24, { name: "Solution" });
  await addPara(solution, tl("home", "about.solution"), bp, { size: "lead", muted: true, max: desktop ? 576 : 512 });
  const link = block(textCol, bp, desktop ? "heading-60" : 40, { name: "Link", align: "start" });
  const button = addInstance(link, "LinkButton", { variant: "primary", icon: "right", Label: tl("home", "about.link") });
  if (!desktop) size(button, "fill");

  if (desktop) {
    const split = columns(inner, 120, { name: "Split", align: "center" });
    const media = frame("Media", { dir: "col", w: "fill" });
    add(split, media);
    size(media, "fill");
    addInstance(media, "ShotFrame", { shot: "about-sources", breakpoint: "desktop", bleed: "false" }, { fill: true });
    const doodle = instance("Doodle", { side: "left" });
    add(media, doodle);
    doodle.layoutPositioning = "ABSOLUTE";
    doodle.x = 532; // the doodle reaches 56px past the picture's top right corner
    doodle.y = -48;
    add(split, textCol);
    size(textCol, "fill");
  } else {
    // On a phone the picture runs to both edges of the screen and comes first.
    addInstance(outer, "ShotFrame", { shot: "about-sources", breakpoint: "mobile", bleed: "true" });
    outer.insertChild(0, outer.children[outer.children.length - 1]);
    add(inner, textCol);
  }

  // Numbers: the measured result in four numbers, how it was measured, and the link.
  const numbers = block(inner, bp, desktop ? 120 : "heading-60", { name: "Numbers" });
  addInstance(numbers, "StatBand", { breakpoint: bp, stats: "4" }, { fill: true });
  const method = block(numbers, bp, 32, { name: "Method" });
  await addPara(method, tl("home", "numbers.method", f), bp, { muted: true, max: 512 });
  const more = block(numbers, bp, 16, { name: "Link", align: "start" });
  addInstance(more, "ArrowLink", { tone: "default", state: "default", Label: tl("home", "numbers.link") });
}

async function gallery(parent, bp) {
  const desktop = bp === "desktop";
  const { inner } = section(parent, bp, { tone: "panel", name: "Gallery", top: 0, bottom: "section", align: "center" });
  addInstance(inner, "SectionHeading", { breakpoint: bp, align: "center", level: "2", Eyebrow: tl("home", "gallery.eyebrow"), Title: tl("home", "gallery.title") });
  const tabs = block(inner, bp, "heading", { name: "Filter", align: "center" });
  if (desktop) addInstance(tabs, "GalleryTabs", { value: "all" });
  else addInstance(tabs, "Select", { state: "default", "Show label": false, Value: tl("home", "gallery.areas.all") }, { fill: true });
  const cards = GALLERY.map(([id, shot, area]) =>
    instance("ShotCard", {
      shot,
      breakpoint: bp,
      "Meta label": tl("home", `gallery.areas.${area}`),
      "Meta icon": AREA_ICON[area],
      Title: tl("home", `gallery.cards.${id}.title`),
      "Link label": tl("home", `gallery.cards.${id}.link`),
    }),
  );
  const panel = block(inner, bp, "heading", { name: "Cards" });
  grid(panel, bp, cards, { cols: desktop ? 3 : 1, gap: 40 });
  const cta = block(inner, bp, "heading-60", { name: "All features", align: "center" });
  addInstance(cta, "LinkButton", { variant: "primary", icon: "right", Label: tl("home", "gallery.cta") });
}

async function examples(parent, bp) {
  const desktop = bp === "desktop";
  const { inner } = section(parent, bp, { name: "Examples" });
  addInstance(inner, "SectionHeading", { breakpoint: bp, align: "start", level: "2", Eyebrow: tl("home", "examples.eyebrow"), Title: tl("home", "examples.title") }, { fill: true });
  const list = block(inner, bp, "heading", { name: "Answers" });
  const cited = instance("AnswerExample", {
    breakpoint: bp,
    "Question label": tl("home", "examples.questionLabel"),
    Question: tl("home", "examples.cited.question"),
    Answer: tl("home", "examples.cited.answer"),
    Source: tl("home", "examples.cited.source"),
    "Tile icon": "Sparkles",
    "Source icon": "File",
  });
  const refused = instance("AnswerExample", {
    breakpoint: bp,
    "Question label": tl("home", "examples.questionLabel"),
    Question: tl("home", "examples.refused.question"),
    Answer: tl("home", "examples.refused.answer"),
    Source: tl("home", "examples.refused.source"),
    "Tile icon": "Unknown",
    "Source icon": "NotFound",
  });
  grid(list, bp, [cited, refused], { cols: desktop ? 2 : 1, gap: 24, rowGap: 24 });
  const note = block(inner, bp, 24, { name: "Note" });
  await addPara(note, tl("home", "examples.note"), bp, { size: "sm", muted: true, max: 512 });
}

export async function homePage(bp) {
  const pg = pageFrame(bp);
  addInstance(pg, "SiteHeader", { breakpoint: bp, menu: "closed", current: "home" }, { fill: true });
  const main = frame("Main", { dir: "col", w: "fill" });
  add(pg, main);
  addInstance(main, "PageHeader", { breakpoint: bp, media: "hero-chat", "Show actions": true }, { fill: true });
  await builtWith(main, bp);
  await strengths(main, bp);
  await about(main, bp);
  await gallery(main, bp);
  await examples(main, bp);
  addInstance(pg, "SiteFooter", { breakpoint: bp }, { fill: true });
  return pg;
}
