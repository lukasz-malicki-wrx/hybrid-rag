/**
 * Landing components, part 2: the pictures and the top of a page.
 * ShotFrame, ShotPair, ShotPhone (the framed screenshots of SplitSection), ShotCard (the gallery
 * card) and PageHeader.
 */
import { boolProp, instance, setup, swapProp, textProp } from "../../lib/components.js";
import { add, frame, rule, size, text } from "../../lib/layout.js";
import { icon } from "../../lib/icons.js";
import { shot } from "../../lib/images.js";
import { layoutSpace } from "../../lib/tokens.js";
import { tl } from "../../lib/text.js";
import { listOf, variantSet } from "../core/shared.js";
import { accentParagraph, arrowLink, BP, eyebrowRow, lt, sideStroke } from "./shared.js";

const PATH = "apps/landing/src/components";
const SHOTS = ["hero-chat", "how-flow", "about-sources", "chat", "sources", "groups", "start", "document", "search-lab", "settings", "mobile-chat"];
/** Where a phone shows the picture edge to edge (a page's top, the about section). */
const BLEED_SHOTS = ["hero-chat", "how-flow", "about-sources"];
const MEDIA_W = { desktop: 540, mobile: 327 };

/** The frame a picture sits in: rounded-xl, 1px border, panel colour, content clipped (1px padding = the border). */
function mediaBox(bp, name = "Media") {
  return frame(name, { dir: "col", pad: 1, radius: "xl", stroke: "border", fill: "panel", clip: true, w: MEDIA_W[bp] });
}

// ---------------------------------------------------------------------------------------------

async function buildShotFrame() {
  const list = [];
  for (const s of SHOTS) {
    list.push({ shot: s, breakpoint: "desktop", bleed: "false" });
    list.push({ shot: s, breakpoint: "mobile", bleed: "false" });
    if (BLEED_SHOTS.includes(s)) list.push({ shot: s, breakpoint: "mobile", bleed: "true" });
  }
  const caption = tl("howItWorks", "ingest.caption");
  const set = await variantSet(
    "ShotFrame",
    listOf(list, async (c, { shot: name, breakpoint: bp, bleed }) => {
      if (bleed === "true") {
        // On a phone the picture runs to both edges: 375x240, cropped from the top left, no border or rounded corners.
        setup(c, { dir: "col", w: 375, h: 240, clip: true });
        add(c, shot(name, "light", 375));
        return;
      }
      setup(c, { dir: "col", pad: 1, radius: "xl", stroke: "border", fill: "panel", clip: true, w: MEDIA_W[bp] });
      add(c, shot(name, "light", MEDIA_W[bp] - 2));
      const cap = frame("Show caption", { dir: "col", pad: 16, w: "fill" });
      sideStroke(cap, "border", ["top"]);
      add(cap, await text(caption, "App/Body", "muted", { name: "Caption", w: "fill" }));
      add(c, cap);
    }),
    {
      columns: 3,
      path: `${PATH}/ui/split-section.tsx`,
      description:
        "A screenshot in the frame SplitSection gives its media (rounded-xl, border, panel colour, 540 wide at 1440, full width on a phone). bleed=true is the phone's picture under the header: 375x240 edge to edge, cropped from the top left. Pick the picture with the shot property (the file name of apps/landing/public/screenshots without -light/-dark); the dark pass swaps it. \"Show caption\" adds the caption under it (the how-it-works sections).",
    },
  );
  textProp(set, "Caption", caption);
  boolProp(set, "Show caption", false);
}

async function buildShotPair() {
  await variantSet(
    "ShotPair",
    listOf(BP.map((breakpoint) => ({ breakpoint })), async (c, { breakpoint: bp }) => {
      setup(c, { dir: "col", pad: 1, radius: "xl", stroke: "border", fill: "panel", clip: true, w: MEDIA_W[bp] });
      add(c, shot("document", "light", MEDIA_W[bp] - 2));
      add(c, rule());
      add(c, shot("search-lab", "light", MEDIA_W[bp] - 2));
    }),
    {
      path: "apps/landing/src/sections/features/group-media.tsx",
      description: "Two screenshots one over the other with a 1px divider (layout=\"pair\": the quality group: the document page and the search lab).",
    },
  );
}

async function buildShotPhone() {
  await variantSet(
    "ShotPhone",
    listOf(BP.map((breakpoint) => ({ breakpoint })), async (c, { breakpoint: bp }) => {
      setup(c, { dir: "col", pad: 1, radius: "xl", stroke: "border", fill: "panel", clip: true, w: MEDIA_W[bp] });
      const inner = frame("Grid", { dir: "row", gap: 1, fill: "border", w: "fill" });
      add(c, inner);
      const phoneW = bp === "desktop" ? 160 : 112;
      const deskW = MEDIA_W[bp] - 2 - 1 - phoneW;
      const left = frame("Desktop picture", { dir: "col", justify: "center", fill: "panel", w: deskW });
      add(inner, left);
      size(left, deskW, "fill");
      add(left, shot("settings", "light", deskW));
      const right = frame("Phone picture", { dir: "col", fill: "panel", w: phoneW });
      add(inner, right);
      size(right, phoneW, "fill");
      add(right, shot("mobile-chat", "light", phoneW));
    }),
    {
      path: "apps/landing/src/sections/features/group-media.tsx",
      description: 'A wide screenshot and a phone one side by side, 1px apart on the border colour (layout="phone": the access group: settings and the phone chat). The phone column is 160 wide (112 on a phone).',
    },
  );
}

// ---------------------------------------------------------------------------------------------

const GALLERY_SHOTS = ["chat", "start", "sources", "groups", "document", "search-lab"];

async function buildShotCard() {
  const list = [];
  for (const s of GALLERY_SHOTS) for (const breakpoint of BP) list.push({ shot: s, breakpoint });
  const meta = tl("home", "gallery.areas.chat");
  const title = tl("home", "gallery.cards.chat.title");
  const link = tl("home", "gallery.cards.chat.link");
  const set = await variantSet(
    "ShotCard",
    listOf(list, async (c, { shot: name, breakpoint: bp }) => {
      const w = bp === "desktop" ? 373 : 327;
      setup(c, { dir: "col", gap: 16, pad: 16, radius: "lg", stroke: "border", fill: "card-raised", w });
      const picture = frame("Picture", { dir: "col", radius: "lg", stroke: "border", clip: true, w: "fill" });
      add(c, picture);
      const r = shot(name, "light", w - 32);
      add(picture, r);
      size(r, "fill");
      const row = frame("Meta", { dir: "row", gap: 8, align: "center" });
      add(row, icon("Chat", 18, "muted", "Meta icon"));
      add(row, await text(meta, "App/Body", "muted", { name: "Meta label" }));
      add(c, row);
      add(c, await text(title, "App/Heading MD", "fg", { name: "Title", w: "fill" }));
      add(c, await arrowLink(link, "default", "Link label"));
    }),
    {
      columns: 4,
      path: `${PATH}/ui/shot-card.tsx`,
      description:
        "A screenshot with its area, a title and an arrow link: a card of the app gallery, on the raised card colour of the panel section it lives in. shot picks the screenshot (the rectangle keeps the name Screenshot/<name>, so the dark pass swaps it). Meta icon: the icon of the area (chat, file, group, check).",
    },
  );
  textProp(set, "Meta label", meta);
  textProp(set, "Title", title);
  textProp(set, "Link label", link);
  swapProp(set, "Meta icon", "Chat");
}

// ---------------------------------------------------------------------------------------------
// PageHeader

async function headerText(bp, { eyebrow, title, lead }) {
  const col = frame("Text", { dir: "col", w: "fill", maxW: 672 });
  const e = frame("Show eyebrow", { dir: "col", pad: [0, 0, 28, 0] });
  add(e, await eyebrowRow(eyebrow, bp));
  add(col, e);
  add(col, await text(title, lt("H1", bp), "fg", { name: "Title", w: "fill" }));
  const l = frame("Lead block", { dir: "col", pad: [bp === "desktop" ? 40 : 32, 0, 0, 0], w: "fill" });
  add(l, await accentParagraph(lead, bp, { w: "fill" }));
  add(col, l);
  const actions = frame("Show actions", { dir: "col", pad: [bp === "desktop" ? 0 : 40, 0, 0, 0], w: "fill" });
  if (bp === "desktop") layoutSpace(actions, "paddingTop", "heading", "desktop"); // sm:mt-15 = 60
  const row = frame("Actions", { dir: bp === "desktop" ? "row" : "col", gap: bp === "desktop" ? 24 : 16, rowGap: 16, wrap: bp === "desktop", align: "center", w: "fill" });
  add(actions, row);
  const a = instance("LinkButton", { variant: "primary", icon: "right", Label: tl("home", "hero.github") });
  const b = instance("LinkButton", { variant: "secondary", icon: bp === "desktop" ? "circle-plain" : "circle", Label: tl("home", "hero.how") });
  add(row, a, b);
  if (bp === "mobile") {
    size(a, "fill");
    size(b, "fill");
    row.counterAxisAlignItems = "MIN";
  }
  add(col, actions);
  return col;
}

async function buildPageHeader() {
  const vals = { eyebrow: tl("home", "hero.eyebrow"), title: tl("home", "hero.title"), lead: tl("home", "hero.lead") };
  const list = [];
  for (const breakpoint of BP) for (const media of ["none", "hero-chat", "how-flow"]) list.push({ breakpoint, media });
  const set = await variantSet(
    "PageHeader",
    listOf(list, async (c, { breakpoint: bp, media }) => {
      setup(c, { dir: "col", gap: bp === "desktop" ? 0 : 40, pad: 0, fill: "panel", w: bp === "desktop" ? 1440 : 375 });
      layoutSpace(c, "paddingTop", "section", bp);
      layoutSpace(c, "paddingBottom", "section", bp);
      const text1 = await headerText(bp, vals);
      if (bp === "desktop") {
        const container = frame("Container", { dir: "row", pad: [0, 120], w: "fill" });
        add(c, container);
        if (media === "none") {
          add(container, text1);
          return;
        }
        const split = frame("Split", { dir: "row", gap: 120, align: "center", w: "fill" });
        add(container, split);
        add(split, text1);
        size(text1, "fill");
        const wrap = frame("Media", { dir: "col", w: "fill" });
        add(split, wrap);
        add(wrap, instance("ShotFrame", { shot: media, breakpoint: "desktop", bleed: "false" }));
        const doodle = instance("Doodle", { side: "right" });
        add(wrap, doodle);
        doodle.layoutPositioning = "ABSOLUTE";
        doodle.x = -56;
        doodle.y = -48;
      } else {
        const container = frame("Container", { dir: "col", pad: [0, 24], w: "fill" });
        add(c, container);
        add(container, text1);
        if (media !== "none") add(c, instance("ShotFrame", { shot: media, breakpoint: "mobile", bleed: "true" }));
      }
    }),
    {
      columns: 3,
      path: `${PATH}/ui/page-header.tsx`,
      description:
        "The top of a page, on the panel colour: eyebrow, the one h1, the accent paragraph, optional buttons (\"Show actions\", the home page's two links) and optionally a picture beside the text (media). Wide: two equal columns, the picture on the right with strokes over its outer top corner. Phone: the text first, then the picture edge to edge. The first section after it is plain.",
    },
  );
  textProp(set, "Eyebrow", vals.eyebrow);
  textProp(set, "Title", vals.title);
  textProp(set, "Lead", vals.lead);
  boolProp(set, "Show actions", false);
}

export async function buildMedia() {
  await buildShotFrame();
  await buildShotPair();
  await buildShotPhone();
  await buildShotCard();
  await buildPageHeader();
}
