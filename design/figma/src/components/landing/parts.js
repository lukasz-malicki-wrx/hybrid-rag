/**
 * Landing components, part 1: the small parts (apps/landing/src/components/ui and layout/brand).
 * Brand, Eyebrow, AccentParagraph, InlineCode, IconTile, ArrowLink, LinkButton, SectionHeading,
 * FeatureCard, Doodle, ContourPattern, StatBand, CtaBand.
 */
import { boolProp, component, instance, setProps, setup, swapProp, textProp } from "../../lib/components.js";
import { add, frame, size, text } from "../../lib/layout.js";
import { icon } from "../../lib/icons.js";
import { layoutSpace, paint } from "../../lib/tokens.js";
import { tl, tlRaw, tw } from "../../lib/text.js";
import { listOf, variantSet } from "../core/shared.js";
import { CONTOUR_PATH } from "./contour-path.js";
import { accentParagraph, arrowLink, BP, card, dimStroke, eyebrowRow, facts, growIn, lt, sideStroke, tile } from "./shared.js";

const PATH = "apps/landing/src/components";

// ---------------------------------------------------------------------------------------------

async function buildBrand() {
  const set = await variantSet(
    "Brand",
    listOf([{ tone: "default" }, { tone: "on-band" }], async (c, { tone }) => {
      setup(c, { dir: "row", gap: 10, align: "center", radius: "lg" });
      const tileBox = frame("Mark", { dir: "row", align: "center", justify: "center", w: 32, h: 32, radius: "lg", fill: "accent" });
      add(tileBox, icon("Sparkles", 18, "accent-fg", "Icon"));
      add(c, tileBox);
      add(c, await text(tw("app.name"), "App/Heading MD", tone === "on-band" ? "band-fg" : "fg", { name: "Name" }));
    }),
    {
      path: `${PATH}/layout/brand.tsx`,
      description: "The mark (the accent sparkles tile of the app) and the name, linking to the home page. tone=on-band is the footer, where the name takes the band text colour.",
    },
  );
  textProp(set, "Name", tw("app.name"));
}

async function buildEyebrow() {
  const set = await variantSet(
    "Eyebrow",
    listOf(BP.map((breakpoint) => ({ breakpoint })), async (c, { breakpoint }) => {
      setup(c, { dir: "row" });
      add(c, await eyebrowRow(tl("home", "strengths.eyebrow"), breakpoint));
    }),
    {
      path: `${PATH}/ui/eyebrow.tsx`,
      description: "The small label over a title: a 40x2 dash in the decoration colour, then the text (a category, not a slogan). Centred headings centre it with their column.",
    },
  );
  textProp(set, "Eyebrow", tl("home", "strengths.eyebrow"));
}

async function buildAccentParagraph() {
  const set = await variantSet(
    "AccentParagraph",
    listOf(BP.map((breakpoint) => ({ breakpoint })), async (c, { breakpoint }) => {
      setup(c, { dir: "row" });
      add(c, await accentParagraph(tl("home", "hero.lead"), breakpoint, { w: breakpoint === "desktop" ? 540 : 327 }));
    }),
    {
      path: `${PATH}/ui/accent-paragraph.tsx`,
      description: "The paragraph under a title, with a 2px line in the decoration colour on its left (pl-4). Lead size, muted, never wider than 32em.",
    },
  );
  textProp(set, "Lead", tl("home", "hero.lead"));
}

async function buildInlineCode() {
  const code = tlRaw("howItWorks", "run.api.text").match(/<code>(.*?)<\/code>/)[1];
  const set = await component(
    "InlineCode",
    async (c) => {
      setup(c, { dir: "row", pad: [2, 6], radius: "sm", fill: "surface-2" });
      add(c, await text(code, "App/Body", "fg", { name: "Code" }));
    },
    { path: `${PATH}/ui/inline-code.tsx`, description: "A short piece of code inside a sentence: a setting, a file name, an address (rounded, surface-2, px-1.5 py-0.5)." },
  );
  textProp(set, "Code", code);
}

async function buildIconTile() {
  const set = await variantSet(
    "IconTile",
    listOf([{ size: "md" }, { size: "lg" }], async (c, { size: s }) => {
      setup(c, { dir: "row" });
      add(c, tile(s, "Sparkles"));
    }),
    {
      path: `${PATH}/ui/icon-tile.tsx`,
      description: "The square tile an icon sits on at the top of a card: md is 56x56 (icon 28), lg is 80x80 (icon 32); surface-2, accent icon, decoration only. FeatureCard and AnswerExample draw the same tile inside, so that the icon is a property of the card.",
    },
  );
  swapProp(set, "Icon", "Sparkles");
}

async function buildArrowLink() {
  const list = [];
  for (const tone of ["default", "on-accent"]) for (const state of ["default", "hover"]) list.push({ tone, state });
  const set = await variantSet(
    "ArrowLink",
    listOf(list, async (c, { tone, state }) => {
      setup(c, { dir: "row" });
      const row = await arrowLink(tl("home", "strengths.items.checkable.link"), tone, "Label", "Icon");
      if (state === "hover") row.findOne((n) => n.type === "TEXT").textDecoration = "UNDERLINE";
      add(c, row);
    }),
    {
      columns: 2,
      path: `${PATH}/ui/arrow-link.tsx`,
      description: '"Learn more →": the TextLink arrow variant, in the colour of what it sits on. tone=on-accent is for the accent call to action band; hover underlines.',
    },
  );
  textProp(set, "Label", tl("home", "strengths.items.checkable.link"));
  swapProp(set, "Icon", "ArrowRight");
}

// LinkButton: the classes of Button (buttonClass) on a link. md only: the landing page uses no other size.
const LINK_BUTTON = {
  primary: { fill: "accent", fg: "accent-fg", style: "App/Body Semibold", icons: ["none", "left", "right"] },
  secondary: { stroke: "border", fg: "fg", style: "App/Body Medium", icons: ["none", "circle", "circle-plain"] },
  band: { fill: "band", fg: "band-fg", style: "App/Body Semibold", icons: ["left"] },
};

async function buildLinkButton() {
  const list = [];
  for (const [variant, v] of Object.entries(LINK_BUTTON)) for (const ic of v.icons) list.push({ variant, icon: ic });
  const label = tl("home", "hero.github");
  const set = await variantSet(
    "LinkButton",
    listOf(list, async (c, { variant, icon: ic }) => {
      const v = LINK_BUTTON[variant];
      const circle = ic.startsWith("circle");
      setup(c, { dir: "row", gap: 6, pad: circle ? [0, 16, 0, 4] : [0, 16], align: "center", justify: "center", radius: "lg", fill: v.fill, stroke: ic === "circle-plain" ? undefined : v.stroke, minH: 44 });
      if (ic === "left") add(c, icon("Repo", 18, v.fg, "Icon"));
      if (circle) {
        const ring = frame("Icon circle", { dir: "row", align: "center", justify: "center", w: 40, h: 40, radius: "full", fill: "accent" });
        add(ring, icon("ArrowRight", 18, "accent-fg", "Circle icon"));
        add(c, ring);
      }
      add(c, await text(label, v.style, v.fg, { name: "Label" }));
      if (ic === "right") add(c, icon("ArrowRight", 18, v.fg, "Icon"));
    }),
    {
      columns: 3,
      path: `${PATH}/ui/link-button.tsx`,
      description:
        "A link that looks like a button: the md Button of packages/ui (min-h-11, rounded-lg, px-4, gap-1.5). variant primary / secondary / band (on the accent band). icon: none, left (repo mark), right (arrow), circle (the accent circle with an arrow, the hero's second link; pl-1), circle-plain (the same without the border, from sm up). On a phone the hero's buttons are full width: resize the instance to fill.",
    },
  );
  textProp(set, "Label", label);
  swapProp(set, "Icon", "Repo");
}

// ---------------------------------------------------------------------------------------------

async function buildSectionHeading() {
  const list = [];
  for (const breakpoint of BP) for (const align of ["start", "center"]) for (const level of ["2", "3"]) list.push({ breakpoint, align, level });
  const eyebrow = tl("home", "strengths.eyebrow");
  const title = tl("home", "strengths.title");
  const lead = tl("howItWorks", "flows.lead");
  const set = await variantSet(
    "SectionHeading",
    listOf(list, async (c, { breakpoint, align, level }) => {
      const center = align === "center";
      setup(c, { dir: "col", align: center ? "center" : "start", w: breakpoint === "desktop" ? 512 : 327, maxW: 512 });
      const e = frame("Show eyebrow", { dir: "col", pad: [0, 0, 28, 0], align: center ? "center" : "start" });
      add(e, await eyebrowRow(eyebrow, breakpoint));
      add(c, e);
      add(c, await text(title, lt(level === "2" ? "H2" : "H3", breakpoint), "fg", { name: "Title", w: "fill", align: center ? "CENTER" : "LEFT" }));
      const l = frame("Show lead", { dir: "col", pad: [16, 0, 0, 0], w: "fill" });
      add(l, await text(lead, lt("Lead", breakpoint), "muted", { name: "Lead", w: "fill", align: center ? "CENTER" : "LEFT" }));
      add(c, l);
    }),
    {
      columns: 4,
      path: `${PATH}/ui/section-heading.tsx`,
      description:
        "The title block of a section: optional eyebrow (mb-7), the heading (h2 for level 2, h3 for level 3), an optional lead (mt-4). It is never wider than max-w-copy (32em of its own 16px = 512): in a column resize it to fill and it stops at 512. align=center centres all three.",
    },
  );
  textProp(set, "Eyebrow", eyebrow);
  textProp(set, "Title", title);
  textProp(set, "Lead", lead);
  boolProp(set, "Show eyebrow", true);
  boolProp(set, "Show lead", false);
}

async function buildFeatureCard() {
  const k = "strengths.items.checkable";
  const list = [];
  for (const breakpoint of BP) for (const background of ["surface", "raised"]) list.push({ breakpoint, background });
  const set = await variantSet(
    "FeatureCard",
    listOf(list, async (c, { breakpoint, background }) => {
      setup(c, { dir: "col", pad: 24, radius: "lg", stroke: "border", fill: background === "raised" ? "card-raised" : "surface", w: breakpoint === "desktop" ? 285 : 327 });
      add(c, tile("md", "Check"));
      const h = frame("Title block", { dir: "col", pad: [24, 0, 0, 0], w: "fill" });
      add(h, await text(tl("home", `${k}.title`), lt("H3", breakpoint), "fg", { name: "Title", w: "fill" }));
      add(c, h);
      const t = frame("Text block", { dir: "col", pad: [12, 0, 0, 0], w: "fill" });
      add(t, await text(tl("home", `${k}.text`), "App/Text Base", "muted", { name: "Text", w: "fill" }));
      add(c, t);
      growIn(c);
      const link = frame("Show link", { dir: "col", pad: [24, 0, 0, 0] });
      add(link, await arrowLink(tl("home", `${k}.link`), "default", "Link label"));
      add(c, link);
    }),
    {
      columns: 2,
      path: `${PATH}/ui/feature-card.tsx`,
      description:
        "A strength or a feature: an icon tile, a title (h3), a sentence and an optional arrow link pushed to the bottom (mt-auto), in a Card with p-6. background=raised is the card on a panel section (--card-bg). In a row of cards resize the instances to fill both ways so the links line up.",
    },
  );
  textProp(set, "Title", tl("home", `${k}.title`));
  textProp(set, "Text", tl("home", `${k}.text`));
  textProp(set, "Link label", tl("home", `${k}.link`));
  boolProp(set, "Show link", true);
  swapProp(set, "Icon", "Check");
}

// ---------------------------------------------------------------------------------------------
// Decoration drawn from SVG: Doodle (three strokes) and ContourPattern (topographic lines).

function tintStrokes(node, role, opacity = 1) {
  const visit = (n) => {
    if ("strokes" in n && n.strokes.length) n.strokes = [paint(role, opacity)];
    if ("children" in n) n.children.forEach(visit);
  };
  visit(node);
}

function vectorInto(c, svg, role) {
  const node = figma.createNodeFromSvg(svg);
  node.fills = [];
  for (const k of [...node.children]) {
    c.appendChild(k);
    k.constraints = { horizontal: "SCALE", vertical: "SCALE" };
  }
  node.remove();
  tintStrokes(c, role);
}

async function buildDoodle() {
  const paths = { right: "M6 24 18 30M16 8 24 20M34 4 36 18", left: "M42 24 30 30M32 8 24 20M14 4 12 18" };
  await variantSet(
    "Doodle",
    listOf([{ side: "right" }, { side: "left" }], (c, { side }) => {
      c.layoutMode = "NONE";
      c.resize(64, 64);
      c.fills = [];
      vectorInto(c, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="64" height="64" fill="none" stroke="#000000" stroke-width="3" stroke-linecap="round"><path d="${paths[side]}"/></svg>`, "ai");
    }),
    {
      path: `${PATH}/ui/doodle.tsx`,
      description:
        "Three hand-drawn strokes in the decoration colour (64px) that mark the outer top corner of a picture; it sits partly outside the corner (56px left, 48px up at 1440). side=right is the one the code draws; side=left is the same flipped (-scale-x-100) for a picture on the left. Wide screens only.",
    },
  );
}

async function buildContourPattern() {
  await component(
    "ContourPattern",
    (c) => {
      c.layoutMode = "NONE";
      c.resize(1200, 240);
      c.fills = [];
      c.clipsContent = true;
      vectorInto(c, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 240" width="1200" height="240" fill="none" stroke="#000000" stroke-width="2"><path d="${CONTOUR_PATH}"/></svg>`, "accent-fg");
    },
    {
      path: `${PATH}/ui/contour-pattern.tsx`,
      description:
        "Topographic contour lines (two hills of nested curves), the real path of the code, drawn in the accent-fg colour. In the call to action it is used at 12% opacity (8% on a phone) and scaled to cover the band; the code also fades it to 35% on the left on wide screens with a gradient mask, which is not drawn here.",
    },
  );
}

// ---------------------------------------------------------------------------------------------
// StatBand

async function statCell(i, bp, value, label, o = {}) {
  const cell = frame(`Stat ${i + 1}`, { dir: "col", gap: 8, pad: [24, 16], align: "center", justify: "end" });
  add(cell, await text(value, lt("Stat", bp), "band-fg", { name: `Value ${i + 1}`, w: "fill", align: "CENTER" }));
  add(cell, await text(label, lt("Lead", bp), "band-muted", { name: `Label ${i + 1}`, w: "fill", align: "CENTER" }));
  if (o.border) sideStroke(cell, "band-muted", ["top"], 0.4);
  return cell;
}

function statDivider(cell) {
  const d = frame("Divider", { dir: "row", w: 2, h: 40, radius: "full", fill: "band-muted", fillOpacity: 0.4 });
  add(cell, d);
  d.layoutPositioning = "ABSOLUTE";
  d.x = 0;
  d.y = Math.max(0, Math.round((cell.height - 40) / 2));
  d.constraints = { horizontal: "MIN", vertical: "CENTER" };
}

function statDefaults() {
  const f = facts();
  return [
    [f.evalQuestions, tl("home", "numbers.items.questions")],
    [f.hybridTop10, tl("home", "numbers.items.top10")],
    [tl("home", "numbers.ratio", f), tl("home", "numbers.items.offTopic")],
    [f.evalPassages, tl("home", "numbers.items.passages")],
  ];
}

async function buildStatBand() {
  const defs = statDefaults();
  const list = [];
  for (const breakpoint of BP) for (const stats of ["4", "3"]) list.push({ breakpoint, stats });
  const set = await variantSet(
    "StatBand",
    listOf(list, async (c, { breakpoint: bp, stats }) => {
      const n = Number(stats);
      if (bp === "desktop") {
        // lg:grid-cols-(--stat-cols) lg:py-10: one row, a divider before every item but the first.
        setup(c, { dir: "row", pad: [40, 0], align: "center", radius: "xl", fill: "band", w: 1200, clip: true });
        for (let i = 0; i < n; i++) {
          const cell = await statCell(i, bp, defs[i][0], defs[i][1]);
          add(c, cell);
          size(cell, "fill");
          if (i > 0) statDivider(cell);
        }
      } else {
        // grid-cols-2 py-4: pairs, a divider before the right-hand one, a rule over every row after the first, a last odd item spans.
        setup(c, { dir: "col", pad: [16, 0], radius: "xl", fill: "band", w: 327, clip: true });
        for (let r = 0; r * 2 < n; r++) {
          const row = frame(`Row ${r + 1}`, { dir: "row", w: "fill" });
          add(c, row);
          for (let i = r * 2; i < Math.min(n, r * 2 + 2); i++) {
            const cell = await statCell(i, bp, defs[i][0], defs[i][1], { border: r > 0 });
            add(row, cell);
            size(cell, "fill");
            if (i % 2 === 1) statDivider(cell);
          }
        }
      }
    }),
    {
      columns: 2,
      path: `${PATH}/ui/stat-band.tsx`,
      description:
        "The dark band of numbers: a figure over its description, thin 2x40 dividers between them. Wide screens: one row. Phone: two columns, a rule over every row after the first, a last odd item spans both columns. stats=4 (home) or 3 (the relevance gate).",
    },
  );
  for (let i = 0; i < 4; i++) {
    textProp(set, `Value ${i + 1}`, defs[i][0]);
    textProp(set, `Label ${i + 1}`, defs[i][1]);
  }
}

// ---------------------------------------------------------------------------------------------
// CtaBand

async function buildCtaBand() {
  const title = tl("common", "cta.title");
  const body = tl("common", "cta.text");
  const command = tl("common", "cta.command");
  const set = await variantSet(
    "CtaBand",
    listOf(BP.map((breakpoint) => ({ breakpoint })), async (c, { breakpoint: bp }) => {
      const desktop = bp === "desktop";
      setup(c, { dir: "col", pad: desktop ? [48, 48] : [40, 24], radius: "xl", fill: "accent", w: desktop ? 1200 : 327, clip: true });
      const body1 = frame("Content", { dir: desktop ? "row" : "col", gap: desktop ? 64 : 32, align: desktop ? "center" : "start", w: "fill" });
      add(c, body1);
      const left = frame("Text column", { dir: "col", gap: 16 });
      add(body1, left);
      size(left, "fill");
      add(left, await text(title, lt("H2", bp), "accent-fg", { name: "Title", w: "fill" }));
      const t = await text(body, lt("Lead", bp), "accent-fg", { name: "Text", w: "fill" });
      add(left, t);
      t.maxWidth = desktop ? 576 : 512;
      const cmd = frame("Command", { dir: "row", pad: desktop ? [12, 16] : [12, 12], radius: "lg", fill: "band" });
      add(cmd, await text(command, desktop ? "App/Body" : "App/Caption", "band-fg", { name: "Command" }));
      add(left, cmd);
      const right = frame("Buttons", { dir: "col", gap: 16, align: desktop ? "start" : "start" });
      add(body1, right);
      const github = instance("LinkButton", { variant: "band", icon: "left", Label: tl("common", "cta.github") });
      add(right, github);
      const how = instance("ArrowLink", { tone: "on-accent", state: "default", Label: tl("common", "cta.how") });
      add(right, how);
      if (!desktop) {
        right.counterAxisAlignItems = "MIN";
        size(right, "fill");
        size(github, "fill");
        size(how, "fill");
        how.primaryAxisAlignItems = "CENTER";
      }
      // The contour lines, behind the text, scaled to cover the band.
      const lines = instance("ContourPattern");
      c.insertChild(0, lines);
      lines.layoutPositioning = "ABSOLUTE";
      const cover = Math.max(c.width / 1200, c.height / 240);
      lines.resize(1200 * cover, 240 * cover);
      lines.x = (c.width - lines.width) / 2;
      lines.y = 0;
      lines.opacity = desktop ? 0.12 : 0.08;
    }),
    {
      path: `${PATH}/ui/cta-band.tsx`,
      description:
        "The call to action: a band in the accent colour (rounded-xl) with contour lines, a title, a sentence, a command in a dark box and the buttons. Wide: text left, buttons right and centred vertically (gap 64, p-12). Phone: one column (gap 32, px-6 py-10), buttons full width. The buttons are a band LinkButton and an on-accent ArrowLink.",
    },
  );
  textProp(set, "Title", title);
  textProp(set, "Text", body);
  textProp(set, "Command", command);
}

export async function buildParts() {
  await buildBrand();
  await buildEyebrow();
  await buildAccentParagraph();
  await buildInlineCode();
  await buildIconTile();
  await buildArrowLink();
  await buildLinkButton();
  await buildSectionHeading();
  await buildFeatureCard();
  await buildDoodle();
  await buildContourPattern();
  await buildStatBand();
  await buildCtaBand();
}
