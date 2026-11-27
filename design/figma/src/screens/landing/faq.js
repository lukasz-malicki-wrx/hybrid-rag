/**
 * FAQ page: apps/landing/src/app/[locale]/faq/page.tsx and sections/faq/*.
 * FaqIntro (a PageHeader without a picture), FaqGroups (the group links beside the lists), FaqMore.
 */
import { instance } from "../../lib/components.js";
import { add, frame, size, text } from "../../lib/layout.js";
import { tl } from "../../lib/text.js";
import { messageParams, sideStroke } from "../../components/landing/shared.js";
import { addInstance, heading, pageFrame, para, section } from "./kit.js";

// FAQ_GROUPS (faq-data.ts)
const GROUPS = [
  ["basics", ["whatIs", "accounts", "cost", "licence"]],
  ["privacy", ["dataWhere", "website", "shared"]],
  ["running", ["hardware", "models", "languages"]],
  ["documents", ["fileTypes", "groups"]],
  ["answers", ["citations", "notFound", "accuracy"]],
];

async function groups(parent, bp) {
  const desktop = bp === "desktop";
  const params = messageParams();
  const { inner } = section(parent, bp, { name: "Questions" });
  // Columns "narrow": the group links (4fr) beside the lists (7fr).
  const wrap = frame("Columns", { dir: desktop ? "row" : "col", gap: desktop ? 120 : 40, w: "fill", align: "start" });
  add(inner, wrap);
  const aside = frame("Groups", { dir: "col", w: desktop ? 393 : "fill" });
  add(wrap, aside);
  const body = frame("Lists", { dir: "col", gap: 48, w: "fill" });
  add(wrap, body);
  if (desktop) size(body, "fill");

  add(aside, await text(tl("faq", "groupsLabel"), "App/Overline", "muted", { name: "Groups label" }));
  const links = frame("Group links", { dir: desktop ? "col" : "row", gap: desktop ? 0 : 20, rowGap: 4, wrap: !desktop, w: "fill" });
  const pad = frame("Links block", { dir: "col", pad: [12, 0, 0, 0], w: "fill" });
  add(pad, links);
  add(aside, pad);
  for (const [id] of GROUPS) add(links, instance("TextLink", { variant: "quiet", state: "default", Label: tl("faq", `groups.${id}`) }));

  let first = true;
  for (const [id, items] of GROUPS) {
    const g = frame(`Group · ${id}`, { dir: "col", w: "fill" });
    add(body, g);
    const h = frame("Heading", { dir: "col", pad: [0, 0, 16, 0], w: "fill" });
    add(h, await heading(tl("faq", `groups.${id}`), bp, "h3"));
    add(g, h);
    const list = frame("Questions", { dir: "col", w: "fill" });
    sideStroke(list, "border", ["top"]);
    add(g, list);
    for (const item of items) {
      const q = instance("FaqItem", {
        state: first ? "open" : "closed", // the first answer is open to show the open state
        Question: tl("faq", `items.${item}.q`),
        Answer: tl("faq", `items.${item}.a`, params),
      });
      first = false;
      add(list, q);
      size(q, "fill");
    }
  }
}

async function more(parent, bp) {
  const { inner } = section(parent, bp, { tone: "panel", name: "More", top: "tight", bottom: "tight", align: "center" });
  const t = await para(tl("faq", "more"), bp, { size: "lead", align: "CENTER" });
  add(inner, t);
  t.maxWidth = bp === "desktop" ? 576 : 512;
}

export async function faqPage(bp) {
  const pg = pageFrame(bp);
  addInstance(pg, "SiteHeader", { breakpoint: bp, menu: "closed", current: "faq" }, { fill: true });
  const main = frame("Main", { dir: "col", w: "fill" });
  add(pg, main);
  addInstance(main, "PageHeader", {
    breakpoint: bp,
    media: "none",
    Eyebrow: tl("faq", "hero.eyebrow"),
    Title: tl("faq", "hero.title"),
    Lead: tl("faq", "hero.lead"),
  }, { fill: true });
  await groups(main, bp);
  await more(main, bp);
  addInstance(pg, "SiteFooter", { breakpoint: bp }, { fill: true });
  return pg;
}

