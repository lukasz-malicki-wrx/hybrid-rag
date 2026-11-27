/**
 * Features page: apps/landing/src/app/[locale]/features/page.tsx and sections/features/*.
 * FeaturesHero, FeaturesOverview, then one section per feature group (sides and tint alternate).
 */
import { instance } from "../../lib/components.js";
import { add, frame, size } from "../../lib/layout.js";
import { layoutSpace } from "../../lib/tokens.js";
import { tl } from "../../lib/text.js";
import { facts } from "../../components/landing/shared.js";
import { addInstance, block, columns, grid, pageFrame, para, section } from "./kit.js";

// FEATURE_GROUPS (groups.ts): the anchor, the icon of the overview card, the pictures and the items.
const GROUPS = [
  { id: "chat", icon: "Chat", shots: ["chat"], layout: "single", items: ["streaming", "stop", "followUps", "feedback", "labels", "personal"] },
  { id: "sources", icon: "File", shots: ["sources"], layout: "single", items: ["citations", "panel", "searched", "record", "original"] },
  { id: "documents", icon: "Group", shots: ["groups"], layout: "single", items: ["upload", "versions", "groups", "favourites", "overview", "softDelete"] },
  { id: "scope", icon: "Search", shots: ["start"], layout: "single", items: ["chip", "pinned", "rule", "inGroup"] },
  { id: "quality", icon: "Check", shots: ["document", "search-lab"], layout: "pair", items: ["gate", "documentPage", "lab", "modes", "evaluation"] },
  { id: "access", icon: "Languages", shots: ["settings", "mobile-chat"], layout: "phone", items: ["languages", "keyboard", "axe", "themes", "phone"] },
];

async function overview(parent, bp) {
  const { inner } = section(parent, bp, { name: "Overview", align: "center" });
  layoutSpace(inner, "itemSpacing", "heading", bp); // mb-heading
  addInstance(inner, "SectionHeading", { breakpoint: bp, align: "center", level: "2", Eyebrow: tl("features", "overview.eyebrow"), Title: tl("features", "overview.title") });
  const cards = GROUPS.map((g) =>
    instance("FeatureCard", {
      breakpoint: bp,
      background: "surface",
      Title: tl("features", `groups.${g.id}.title`),
      Text: tl("features", `groups.${g.id}.lead`),
      "Link label": tl("features", `groups.${g.id}.more`),
      Icon: g.icon,
    }),
  );
  grid(inner, bp, cards, { cols: bp === "desktop" ? 3 : 1, gap: 20 });
}

function media(group, bp) {
  if (group.layout === "pair") return instance("ShotPair", { breakpoint: bp });
  if (group.layout === "phone") return instance("ShotPhone", { breakpoint: bp });
  return instance("ShotFrame", { shot: group.shots[0], breakpoint: bp, bleed: "false" });
}

async function groupSection(parent, bp, group, index) {
  const desktop = bp === "desktop";
  const f = facts();
  const { inner } = section(parent, bp, { tone: index % 2 === 0 ? "panel" : "plain", name: `Group · ${group.id}`, gap: desktop ? undefined : 40 });
  const textCol = frame("Text", { dir: "col", w: "fill" });
  addInstance(textCol, "SectionHeading", { breakpoint: bp, align: "start", level: "2", "Show eyebrow": false, "Show lead": true, Title: tl("features", `groups.${group.id}.title`), Lead: tl("features", `groups.${group.id}.lead`) }, { fill: true });
  const list = block(textCol, bp, 32, { name: "Items", gap: 20 });
  for (const item of group.items) {
    const li = frame("Item", { dir: "col", gap: 4, w: "fill" });
    add(list, li);
    add(li, await para(tl("features", `items.${item}.title`, f), bp, { style: "App/Title" }));
    add(li, await para(tl("features", `items.${item}.text`, f), bp, { size: "sm", muted: true }));
  }
  if (group.id === "quality") {
    const more = block(textCol, bp, 24, { name: "More", align: "start" });
    addInstance(more, "ArrowLink", { tone: "default", state: "default", Label: tl("features", "more.evaluation") });
  }
  const m = media(group, bp);
  if (desktop) {
    const split = columns(inner, 120, { name: "Split", align: "start" });
    const left = index % 2 === 0;
    if (left) {
      add(split, m);
      add(split, textCol);
    } else {
      add(split, textCol);
      add(split, m);
    }
    size(m, "fill");
    size(textCol, "fill");
  } else {
    // On a phone the picture comes first, the text under it (gap-10).
    add(inner, m);
    add(inner, textCol);
  }
}

export async function featuresPage(bp) {
  const pg = pageFrame(bp);
  addInstance(pg, "SiteHeader", { breakpoint: bp, menu: "closed", current: "features" }, { fill: true });
  const main = frame("Main", { dir: "col", w: "fill" });
  add(pg, main);
  addInstance(main, "PageHeader", {
    breakpoint: bp,
    media: "hero-chat",
    Eyebrow: tl("features", "hero.eyebrow"),
    Title: tl("features", "hero.title"),
    Lead: tl("features", "hero.lead"),
  }, { fill: true });
  await overview(main, bp);
  for (let i = 0; i < GROUPS.length; i++) await groupSection(main, bp, GROUPS[i], i);
  addInstance(pg, "SiteFooter", { breakpoint: bp }, { fill: true });
  return pg;
}

