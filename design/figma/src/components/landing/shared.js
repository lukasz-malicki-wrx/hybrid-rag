/**
 * Helpers shared by the landing components and screens: breakpoints, text style names, the numbers
 * the texts quote (config/facts.ts), and small builders for the parts that several components
 * draw the same way (eyebrow, accent paragraph, icon tile, arrow link, card).
 */
import { DATA } from "../../generated/data.js";
import { add, frame, text } from "../../lib/layout.js";
import { icon } from "../../lib/icons.js";
import { tl, LOCALE } from "../../lib/text.js";
import { paint, strokeSides } from "../../lib/tokens.js";

export const BP = ["desktop", "mobile"];
const CAP = { desktop: "Desktop", mobile: "Mobile" };

/** "Landing/H2 Desktop" ... : the fluid type scale at 1440 px or 375 px. */
export const lt = (name, bp) => `Landing/${name} ${CAP[bp]}`;

/** Side margin of a page: 24 px gutter, and at 1440 px (1248 container, 24 gutter) 96 + 24 = 120. */
export const MARGIN = { desktop: 120, mobile: 24 };
export const PAGE_W = { desktop: 1440, mobile: 375 };
/** The width of the page content (1200 at 1440, 327 at 375). */
export const CONTENT_W = { desktop: 1200, mobile: 327 };

/** Strokes with opacity: `border-band-muted/40`. */
export function dimStroke(node, role, opacity = 0.4) {
  node.strokes = [paint(role, opacity)];
  return node;
}

/** A border on chosen sides, with opacity. */
export function sideStroke(node, role, sides, opacity = 1) {
  strokeSides(node, role, sides, 1);
  if (opacity !== 1) node.strokes = [paint(role, opacity)];
  return node;
}

// ---------------------------------------------------------------------------------------------
// The numbers of apps/landing/src/config/facts.ts, formatted by its own factParams(locale) in build.mjs.

/** Every fact as a text, to pass as the variables of tl(). */
export function facts() {
  return { ...DATA.texts.config.facts };
}

/** The facts plus `sent`, as lib/message-params.ts does. */
export function messageParams() {
  const f = facts();
  return { ...f, sent: tl("privacy", "app.claude.sent", f) };
}

/** The author's name (config/site.ts), for the copyright line and the about text. */
export const AUTHOR = DATA.texts.config.author;

// ---------------------------------------------------------------------------------------------
// Parts drawn the same way in several components.

/** The eyebrow row: a 40x2 dash in the decoration colour, then the label. */
export async function eyebrowRow(label, bp, name = "Eyebrow") {
  const row = frame("Eyebrow", { dir: "row", gap: 12, align: "center" });
  add(row, frame("Dash", { dir: "row", w: 40, h: 2, fill: "ai" }));
  add(row, await text(label, lt("Eyebrow", bp), "muted", { name }));
  return row;
}

/** The paragraph with a 2px line in the decoration colour on its left (AccentParagraph). */
export async function accentParagraph(label, bp, o = {}) {
  const box = frame(o.frameName || "Accent paragraph", { dir: "row", pad: [0, 0, 0, 16], w: o.w, maxW: bp === "desktop" ? 576 : 512 });
  sideStroke(box, "ai", ["left"]);
  box.strokeLeftWeight = 2;
  box.strokes = [paint("ai")];
  add(box, await text(label, lt("Lead", bp), "muted", { name: o.name || "Lead", w: "fill" }));
  return box;
}

/** The square an icon sits on at the top of a card (IconTile): size-14 or size-20, surface-2, accent icon. */
export function tile(kind, iconName, layerName = "Icon") {
  const px = kind === "lg" ? 80 : 56;
  const t = frame(kind === "lg" ? "Icon tile 80" : "Icon tile 56", { dir: "row", align: "center", justify: "center", w: px, h: px, radius: "lg", fill: "surface-2" });
  add(t, icon(iconName, kind === "lg" ? 32 : 28, "accent", layerName));
  return t;
}

/** "Learn more →": a link with an arrow (ArrowLink drawn inline). */
export async function arrowLink(label, tone = "default", name = "Link label", iconLayer = "Arrow") {
  const fg = tone === "on-accent" ? "accent-fg" : "fg";
  const row = frame("Arrow link", { dir: "row", gap: 8, pad: [4, 0], minH: 24, align: "center" });
  add(row, await text(label, "App/Body Medium", fg, { name }));
  add(row, icon("ArrowRight", 18, fg, iconLayer));
  return row;
}

/** The bordered block of the shared Card: rounded-lg, 1px border, surface (or card-raised on a panel). */
export function card(name, o = {}) {
  return frame(name, { dir: o.dir || "col", gap: o.gap, pad: o.pad, align: o.align, justify: o.justify, w: o.w, h: o.h, minH: o.minH, radius: "lg", stroke: "border", fill: o.bg === "raised" ? "card-raised" : "surface", clip: o.clip });
}

/** A column that grows to take the room left in its parent (the `mt-auto` of the code). */
export function growIn(parent, name = "Spacer") {
  const s = frame(name, { dir: "col" });
  add(parent, s);
  s.layoutGrow = 1;
  return s;
}

/** Heading texts: the heading size of the landing scale, balanced, in the foreground colour. */
export const HEADING = { h1: "H1", h2: "H2", h3: "H3" };

/** The commands of the quick start (sections/how-it-works/commands.ts): not translated, the same in every language. */
export const START_COMMAND = DATA.texts.config.startCommand;
export const SEED_COMMAND = DATA.texts.config.seedCommand;
