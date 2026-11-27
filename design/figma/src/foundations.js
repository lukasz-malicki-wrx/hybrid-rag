/**
 * Foundations of the Design System page: cover, colours, typography, spacing/radius/shadows, grid and
 * the icon sheet. Everything is drawn from the variables, styles and data the plugin created, so
 * the boards cannot drift from the code. The words on these boards are documentation labels.
 */
import { DATA } from "./generated/data.js";
import { add, frame, shadow, text } from "./lib/layout.js";
import { board } from "./lib/pages.js";
import { RADII, SPACING, resolvedHex } from "./lib/tokens.js";
import { allEffectStyles, allTextStyles } from "./lib/styles.js";
import { get } from "./lib/components.js";
import { iconNames } from "./lib/icons.js";
import { tl, tw } from "./lib/text.js";

// ---------------------------------------------------------------------------------------------
// Contrast (WCAG 2.1) computed from the resolved hex values.

function luminance(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  const lin = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function grade(r) {
  return r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA large only" : "fails";
}

/** Text roles and the surface they are set on. */
const ON = {
  fg: "bg",
  muted: "bg",
  accent: "bg",
  "accent-fg": "accent",
  danger: "bg",
  "danger-fg": "danger",
  "warn-fg": "warn-bg",
  ok: "bg",
  focus: "bg",
  ai: "bg",
  "mark-fg": "mark",
  "band-fg": "band",
  "band-muted": "band",
};
const SURFACES = ["bg", "surface", "surface-2", "panel", "card-raised", "bubble-user", "bubble-ai", "chip", "warn-bg", "mark", "band"];

function contrastLine(role) {
  const against = ON[role] || (SURFACES.includes(role) ? null : null);
  const parts = [];
  for (const scheme of ["light", "dark"]) {
    if (against) {
      const r = ratio(resolvedHex(role, scheme), resolvedHex(against, scheme));
      parts.push(`${scheme} ${r.toFixed(1)}:1 ${grade(r)}`);
    } else if (SURFACES.includes(role)) {
      const fgRole = role === "band" ? "band-fg" : role === "warn-bg" ? "warn-fg" : role === "mark" ? "mark-fg" : "fg";
      const r = ratio(resolvedHex(fgRole, scheme), resolvedHex(role, scheme));
      parts.push(`${scheme} ${r.toFixed(1)}:1 ${grade(r)}`);
    }
  }
  if (!parts.length) return null;
  const head = against ? `Contrast on ${against}` : `Contrast of ${role === "band" ? "band-fg" : role === "warn-bg" ? "warn-fg" : role === "mark" ? "mark-fg" : "fg"}`;
  return `${head}: ${parts.join(" · ")}`;
}

const GROUPS = [
  ["Surfaces", ["bg", "surface", "surface-2", "panel", "card-raised", "bubble-user", "bubble-ai", "chip", "border"]],
  ["Text", ["fg", "muted"]],
  ["Accent & focus", ["accent", "accent-fg", "focus"]],
  ["Status", ["danger", "danger-fg", "warn-bg", "warn-fg", "ok", "mark", "mark-fg"]],
  ["Landing band", ["band", "band-fg", "band-muted"]],
  ["AI", ["ai"]],
];

async function swatchCard(role) {
  const card = frame(`Role · ${role}`, { dir: "col", gap: 12, pad: 16, fill: "bg", radius: "lg", stroke: "border", w: 288 });
  const textRole = role in ON;
  const swatch = frame("Swatch", { dir: "row", align: "center", justify: "center", fill: textRole ? ON[role] : role, radius: "md", stroke: "border", w: "fill", h: 72 });
  if (textRole) add(swatch, await text("Aa", "App/Heading LG", role, { name: "Sample" }));
  add(card, swatch);
  add(card, await text(role, "App/Body Semibold", "fg", { w: "fill" }));
  add(card, await text(`--color-${role}`, "App/Caption", "muted", { w: "fill" }));
  add(card, await text(`Light ${resolvedHex(role, "light")} · Dark ${resolvedHex(role, "dark")}`, "App/Caption", "fg", { w: "fill" }));
  const c = contrastLine(role);
  if (c) add(card, await text(c, "App/Caption", "fg", { w: "fill" }));
  return card;
}

async function buildColours(place) {
  const { board: b, body } = await board("Colours", "The roles of packages/design-tokens/src/theme.css. Every fill and stroke in this file is bound to one of these variables (Theme collection, Light and Dark).", { dir: "col", gap: 48 });
  const roles = Object.keys(DATA.colours.roles);
  const listed = new Set(GROUPS.flatMap(([, r]) => r));
  const groups = GROUPS.map(([n, r]) => [n, r.filter((x) => roles.includes(x))]);
  const rest = roles.filter((r) => !listed.has(r));
  if (rest.length) groups.push(["Other", rest]);
  for (const [name, list] of groups) {
    const g = frame(`Group · ${name}`, { dir: "col", gap: 24, w: "fill" });
    add(g, await text(name, "App/Heading LG", "fg"));
    const row = frame("Swatches", { dir: "row", gap: 24, wrap: true, w: "fill", align: "start" });
    for (const r of list) add(row, await swatchCard(r));
    add(g, row);
    add(body, g);
  }
  place(b);
}

// ---------------------------------------------------------------------------------------------

function sampleFor(name) {
  if (name.startsWith("Landing/")) {
    if (/H1|H2|H3|Stat/.test(name)) return tl("home", "hero.title");
    if (/Eyebrow/.test(name)) return tl("home", "hero.eyebrow");
    if (/Lead|Body/.test(name)) return tl("home", "hero.lead");
    return tl("common", "footer.tagline");
  }
  if (/Overline/.test(name)) return tw("start.examples");
  if (/Bar|Title|Heading|Caption Heading/.test(name)) return tw("chat.newHeading");
  if (/Caption|Preview/.test(name)) return tw("composer.hint");
  if (/Message/.test(name)) return tw("answer.refusal");
  return tw("start.example1");
}

async function buildTypography(place) {
  const { board: b, body } = await board("Typography", "Text styles. App/* mirror packages/ui heading.tsx and text.tsx (Tailwind sizes); Landing/* are the fluid scale of apps/landing at 1440 and 375 px. Inter, never below 12 px.", { dir: "col", gap: 64 });
  for (const prefix of ["App", "Landing"]) {
    const g = frame(`Group · ${prefix}`, { dir: "col", gap: 24, w: "fill" });
    add(g, await text(`${prefix} styles`, "App/Heading LG", "fg"));
    for (const s of allTextStyles().filter((x) => x.name.startsWith(`${prefix}/`))) {
      const row = frame(`Style · ${s.name}`, { dir: "row", gap: 40, pad: [16, 0], align: "start", w: "fill", stroke: { role: "border", sides: ["bottom"] } });
      const meta = frame("Spec", { dir: "col", gap: 4, w: 320 });
      add(meta, await text(s.name, "App/Body Semibold", "fg", { w: 320 }));
      const lh = s.lineHeight && s.lineHeight.value ? s.lineHeight.value : "auto";
      add(meta, await text(`${s.fontSize} / ${lh} px · ${s.fontName.style}${s.textCase === "UPPER" ? " · uppercase" : ""}`, "App/Caption", "muted", { w: 320 }));
      if (s.description) add(meta, await text(s.description, "App/Caption", "muted", { w: 320 }));
      add(row, meta);
      const sample = await text(sampleFor(s.name), s.name, "fg", { name: "Sample", w: 1000 });
      add(row, sample);
      add(g, row);
    }
    add(body, g);
  }
  place(b);
}

// ---------------------------------------------------------------------------------------------

async function buildSizes(place) {
  const { board: b, body } = await board("Spacing, radius & shadows", "Spacing scale (Tailwind steps the code uses), corner radii named as in Tailwind 4, and the effect styles. All of them are variables or styles; nothing in the file uses a loose number.", { dir: "col", gap: 64 });

  const sp = frame("Group · Spacing", { dir: "col", gap: 12, w: "fill" });
  add(sp, await text("Spacing", "App/Heading LG", "fg"));
  for (const px of SPACING) {
    const row = frame(`Spacing · ${px}`, { dir: "row", gap: 16, align: "center", w: "fill" });
    add(row, await text(`spacing/${px}`, "App/Body", "fg", { w: 160 }));
    add(row, await text(`${px} px`, "App/Caption", "muted", { w: 64 }));
    const bar = frame("Bar", { dir: "row", fill: "accent", radius: "xs", w: Math.max(px, 1), h: 16 });
    add(row, bar);
    add(sp, row);
  }
  add(body, sp);

  const rd = frame("Group · Radius", { dir: "col", gap: 24, w: "fill" });
  add(rd, await text("Radius", "App/Heading LG", "fg"));
  const rrow = frame("Radii", { dir: "row", gap: 40, wrap: true, w: "fill", align: "start" });
  for (const [name, px] of Object.entries(RADII)) {
    const cell = frame(`Radius · ${name}`, { dir: "col", gap: 8, align: "center" });
    add(cell, frame("Square", { dir: "row", fill: "surface-2", stroke: "border", radius: name, w: 96, h: 96 }));
    add(cell, await text(`radius/${name}`, "App/Body", "fg"));
    add(cell, await text(px === 9999 ? "full" : `${px} px`, "App/Caption", "muted"));
    add(rrow, cell);
  }
  add(rd, rrow);
  add(body, rd);

  const ef = frame("Group · Shadows", { dir: "col", gap: 24, w: "fill" });
  add(ef, await text("Shadows", "App/Heading LG", "fg"));
  const erow = frame("Effects", { dir: "row", gap: 48, wrap: true, w: "fill", align: "start", pad: [0, 0, 32, 0] });
  for (const s of allEffectStyles()) {
    const card = frame(`Effect · ${s.name}`, { dir: "col", gap: 8, pad: 24, fill: "bg", radius: "lg", w: 288, h: 144, justify: "end" });
    add(card, await text(s.name, "App/Body Semibold", "fg", { w: "fill" }));
    if (s.description) add(card, await text(s.description, "App/Caption", "muted", { w: "fill" }));
    await shadow(card, s.name);
    add(erow, card);
  }
  add(ef, erow);
  add(body, ef);
  place(b);
}

// ---------------------------------------------------------------------------------------------

const BREAKPOINTS = [
  [320, "Narrowest supported width. Rail and column are a drawer; the chat uses the full width."],
  [768, "md: two-column forms, the landing header keeps its menu."],
  [1024, "lg: rail (64) and column (320) are static next to the chat panel."],
  [1280, "xl: the sources panel (384) sits beside the chat instead of over it."],
  [1440, "Design width of the landing page and of the app screens."],
];

async function buildGrid(place) {
  const { board: b, body } = await board("Grid & layout", "Breakpoints, the landing container and the app frame. Diagrams are drawn at half size.", { dir: "col", gap: 64 });
  const K = 0.5;

  const bp = frame("Group · Breakpoints", { dir: "col", gap: 16, w: "fill" });
  add(bp, await text("Breakpoints", "App/Heading LG", "fg"));
  for (const [px, note] of BREAKPOINTS) {
    const row = frame(`Breakpoint · ${px}`, { dir: "row", gap: 24, align: "center", w: "fill" });
    add(row, await text(`${px} px`, "App/Body Semibold", "fg", { w: 80 }));
    const bar = frame("Width", { dir: "row", fill: "surface-2", stroke: "border", radius: "sm", w: px * K, h: 24 });
    add(row, bar);
    add(row, await text(note, "App/Body", "muted", { w: 760 }));
    add(bp, row);
  }
  add(body, bp);

  const lc = frame("Group · Landing container", { dir: "col", gap: 16, w: "fill" });
  add(lc, await text("Landing container", "App/Heading LG", "fg"));
  add(lc, await text(`Container ${DATA.landing.containerPage} px, centred, with a ${DATA.landing.spacing.gutter.desktop} px gutter on each side (shown at 1440).`, "App/Body", "muted", { w: 960 }));
  const page = frame("Page 1440", { dir: "row", justify: "center", fill: "bg", stroke: "border", radius: "sm", w: 1440 * K, h: 120 });
  const cont = frame("Container", { dir: "row", pad: [0, 12], align: "stretch", fill: "accent", fillOpacity: 0.15, w: DATA.landing.containerPage * K, h: 120 });
  add(cont, frame("Content", { dir: "row", fill: "surface-2", w: "fill", h: "fill" }));
  add(page, cont);
  add(lc, page);
  add(body, lc);

  const sec = frame("Group · Section spacing", { dir: "col", gap: 12, w: "fill" });
  add(sec, await text("Landing spacing (variables layout/…)", "App/Heading LG", "fg"));
  for (const [name, v] of Object.entries(DATA.landing.spacing)) {
    for (const bpName of ["desktop", "mobile"]) {
      const row = frame(`Spacing · ${name} ${bpName}`, { dir: "row", gap: 16, align: "center", w: "fill" });
      add(row, await text(`${name} · ${bpName}`, "App/Body", "fg", { w: 200 }));
      add(row, await text(`${v[bpName]} px`, "App/Caption", "muted", { w: 64 }));
      add(row, frame("Bar", { dir: "row", fill: "accent", radius: "xs", w: Math.max(v[bpName], 1), h: 16 }));
      add(sec, row);
    }
  }
  add(body, sec);

  const app = frame("Group · App frame", { dir: "col", gap: 16, w: "fill" });
  add(app, await text("App frame (1440 wide, full window)", "App/Heading LG", "fg"));
  const win = frame("Window", { dir: "row", fill: "bg", stroke: "border", radius: "sm", w: 1440 * K, h: 280, align: "stretch" });
  const parts = [
    ["Rail 64", 64, "surface-2"],
    ["Column 320", 320, "surface"],
    ["Chat panel", null, "panel"],
    ["Sources 384", 384, "surface"],
  ];
  for (const [label, w, role] of parts) {
    const part = frame(`Region · ${label}`, { dir: "col", pad: 8, fill: role, stroke: "border", w: w === null ? "fill" : w * K, h: "fill" });
    add(part, await text(label, "App/Caption", "fg", { w: "fill" }));
    add(win, part);
  }
  add(app, win);
  add(app, await text("Rail 64 (right edge 1 px), column 320 (content 288), chat panel with 16 px margin right and bottom and content up to 736, sources panel 384 from xl. Below lg the rail and the column are a drawer.", "App/Body", "muted", { w: 960 }));
  add(body, app);
  place(b);
}

// ---------------------------------------------------------------------------------------------

async function buildIcons(place) {
  const { board: b, body } = await board("Icons", "Lucide (stroke 1.75) and brand marks (Simple Icons) of packages/ui/src/icons as components Icon/<Name>. The app draws them at 18 px; the colour follows the fg role.", { dir: "row", gap: 24 });
  for (const n of iconNames()) {
    const cell = frame(`Cell · ${n}`, { dir: "col", gap: 12, pad: 16, align: "center", fill: "bg", radius: "lg", stroke: "border", w: 144 });
    add(cell, get(`Icon/${n}`));
    add(cell, await text(n, "App/Caption", "muted", { align: "CENTER" }));
    add(body, cell);
  }
  place(b);
}

// ---------------------------------------------------------------------------------------------

async function buildCover(page, place) {
  const cover = frame("Cover", { dir: "col", gap: 24, pad: 120, fill: "band", justify: "end", w: 1920, h: 960 });
  add(cover, frame("Accent bar", { dir: "row", fill: "accent", radius: "full", w: 96, h: 8 }));
  add(cover, await text(tw("app.name"), "Landing/Lead Desktop", "band-fg", { name: "Product" }));
  add(cover, await text(tl("home", "hero.title"), "Landing/H1 Desktop", "band-fg", { name: "Tagline", w: 1200 }));
  add(cover, await text("Design system · v1 · Generated from the repo", "Landing/Small", "band-muted", { name: "Version" }));
  place(cover);
  if (typeof figma.setFileThumbnailNodeAsync === "function") {
    try {
      await figma.setFileThumbnailNodeAsync(cover);
    } catch (e) {
      /* a thumbnail is optional */
    }
  }
}

export async function buildFoundations(page, place) {
  await buildCover(page, place);
  await buildColours(place);
  await buildTypography(place);
  await buildSizes(place);
  await buildGrid(place);
  await buildIcons(place);
}
