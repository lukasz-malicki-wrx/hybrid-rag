/**
 * Core components: packages/ui/src/components, one Figma component (set) per file of the code,
 * with the code's prop names as variant properties. Built before the landing and app components,
 * which are made of instances of these.
 *
 * Properties by component (names and values exactly as in the code):
 *  Button        variant, size, state + Label (text), "Icon left", "Icon right" (boolean + swap)
 *  IconButton    variant, tone, state + Icon (swap)
 *  Badge         tone + Label, Icon (boolean + swap)
 * The rest is in core/forms.js and core/overlays.js; the report of the build lists everything.
 */
import { component, textProp, boolProp, swapProp, setup } from "../lib/components.js";
import { add, frame, text } from "../lib/layout.js";
import { icon } from "../lib/icons.js";
import { tl, tw } from "../lib/text.js";
import { STATES, STYLE, listOf, ring, variantSet } from "./core/shared.js";
import { buildForms } from "./core/forms.js";
import { buildOverlays } from "./core/overlays.js";

// ---------------------------------------------------------------------------------------------
// Button (button.tsx): VARIANTS x SIZES, only the combinations the apps use.

const BUTTON_VARIANT = {
  primary: { fill: "accent", fg: "accent-fg", w: "semi", hover: { opacity: 0.9 } },
  secondary: { stroke: "border", fg: "fg", w: "med", hover: { fill: "surface" } },
  ghost: { fg: "fg", w: "reg", hover: { fill: "surface-2" } },
  danger: { fill: "danger", fg: "danger-fg", w: "semi", hover: { opacity: 0.9 } },
  "danger-ghost": { fg: "danger", w: "reg", hover: { fill: "surface-2" } },
  link: { fg: "accent", w: "reg", hover: { underline: true } },
  quiet: { fg: "muted", w: "med", hover: { fill: "surface-2", fg: "fg" } },
  tile: { fill: "surface", fg: "fg", w: "med", hover: { fill: "surface-2" } },
  chip: { fill: "chip", fg: "fg", w: "med", hover: { opacity: 0.8 } },
  "chip-ghost": { fg: "fg", w: "med", hover: { fill: "chip" } },
  band: { fill: "band", fg: "band-fg", w: "semi", hover: { opacity: 0.9 } },
};

// min-h-11 gap-1.5 rounded-lg px-4 text-sm ... (icon: the size of the icon the apps put in it)
const BUTTON_SIZE = {
  md: { minH: 44, gap: 6, pad: [0, 16], radius: "lg", t: "sm", icon: 18 },
  sm: { minH: 40, gap: 6, pad: [0, 12], radius: "lg", t: "sm", icon: 18 },
  text: { minH: 40, gap: 6, pad: 0, radius: "lg", t: "sm", icon: 18 },
  field: { minH: 40, gap: 6, pad: [0, 10], radius: "lg", t: "xs", icon: 18 },
  tile: { minH: 32, gap: 6, pad: [0, 12], radius: "lg", t: "xs", icon: 14 },
  xs: { h: 24, gap: 4, pad: [0, 10], radius: "lg", t: "xs", icon: 12 },
  inline: { gap: 6, pad: [1, 2], radius: "sm", t: "xs", icon: 0 },
};

const BUTTON_COMBOS = [
  ["md", ["primary", "secondary", "ghost", "danger", "danger-ghost", "quiet", "band"]],
  ["sm", ["primary", "secondary", "ghost", "danger", "quiet", "chip", "band"]],
  ["text", ["link"]],
  ["field", ["chip-ghost"]],
  ["tile", ["tile"]],
  ["xs", ["chip"]],
  ["inline", ["link"]],
];

async function drawButton(c, { variant, size, state }) {
  const v = BUTTON_VARIANT[variant];
  const s = BUTTON_SIZE[size];
  const hover = state === "hover" ? v.hover : {};
  const fg = hover.fg || v.fg;
  setup(c, {
    dir: "row",
    gap: s.gap,
    pad: s.pad,
    align: "center",
    justify: "center",
    radius: s.radius,
    fill: hover.fill || v.fill,
    stroke: v.stroke && state !== "focus" ? v.stroke : undefined,
    minH: s.minH,
    h: s.h,
  });
  if (state === "focus") ring(c);
  if (hover.opacity) c.opacity = hover.opacity;
  if (state === "disabled") c.opacity = 0.6; // disabled:opacity-60
  if (s.icon) add(c, icon("Plus", s.icon, fg, "Icon left"));
  add(c, await text(tw("composer.send"), STYLE[s.t][v.w], fg, { name: "Label", underline: !!hover.underline }));
  if (s.icon) add(c, icon("ArrowRight", s.icon, fg, "Icon right"));
}

async function buildButton() {
  const list = [];
  for (const [size, names] of BUTTON_COMBOS) for (const variant of names) for (const state of STATES) list.push({ variant, size, state });
  const set = await variantSet("Button", listOf(list, drawButton), {
    columns: 4,
    path: "packages/ui/src/components/button.tsx",
    description:
      'The action button. variant picks the look (primary, secondary, ghost, danger, danger-ghost, link, quiet, tile, chip, chip-ghost, band), size owns height, padding and text size (md, sm, text, field, tile, xs, inline); only the combinations the apps use exist. Show an icon with "Icon left" / "Icon right".',
  });
  textProp(set, "Label", tw("composer.send"));
  boolProp(set, "Icon left", false);
  boolProp(set, "Icon right", false);
  swapProp(set, "Icon left", "Plus");
  swapProp(set, "Icon right", "ArrowRight");
}

// ---------------------------------------------------------------------------------------------
// IconButton (icon-button.tsx, lib/tile.ts)

async function drawIconButton(c, { variant, tone, state }) {
  const tile = variant === "tile" || variant === "accent";
  let fg = tone === "danger" ? "muted" : tone === "strong" ? "fg" : "muted";
  let bg = tile ? (variant === "accent" ? "accent" : "surface") : undefined;
  if (state === "hover") {
    if (variant === "accent") {
      /* hover:opacity-90 */
    } else {
      bg = "surface-2";
      fg = tone === "danger" ? "danger" : "fg";
    }
  }
  if (state === "pressed") fg = "accent";
  if (variant === "accent") fg = "accent-fg";
  setup(c, {
    dir: "row",
    align: "center",
    justify: "center",
    radius: "lg",
    fill: bg,
    pad: tile ? 0 : variant === "compact" ? 6 : 8,
    w: tile ? 32 : undefined,
    h: tile ? 32 : undefined,
  });
  if (variant === "accent" && state === "hover") c.opacity = 0.9;
  if (state === "focus") ring(c);
  add(c, icon("Plus", 18, fg, "Icon"));
}

async function buildIconButton() {
  const list = [];
  const push = (variant, tones, states) => {
    for (const tone of tones) for (const state of states) list.push({ variant, tone, state });
  };
  const s5 = ["default", "hover", "focus", "pressed"];
  push("default", ["default", "strong", "danger"], s5);
  push("compact", ["default"], s5);
  push("tile", ["default"], s5);
  push("tile", ["danger"], ["default", "hover", "focus"]);
  push("accent", ["default"], ["default", "hover", "focus"]);
  const set = await variantSet("IconButton", listOf(list, drawIconButton), {
    columns: 4,
    path: "packages/ui/src/components/icon-button.tsx",
    description:
      'A button with only an icon (it always has an aria-label in the code). variant: default (bare, 8px padding), compact (6px), tile (32x32 on a surface, pane bars and rail), accent (the tile in the accent colour). tone: default, strong (icon in fg), danger (turns red on hover). state "pressed" is aria-pressed (accent icon).',
  });
  swapProp(set, "Icon", "Plus");
}

// ---------------------------------------------------------------------------------------------

async function buildBadge() {
  const set = await variantSet(
    "Badge",
    listOf([{ tone: "neutral" }, { tone: "warn" }], async (c, { tone }) => {
      const fg = tone === "warn" ? "warn-fg" : "muted";
      setup(c, { dir: "row", gap: 4, pad: [2, 8], align: "center", radius: "full", fill: tone === "warn" ? "warn-bg" : "surface-2" });
      add(c, icon("Alert", 14, fg, "Icon"));
      add(c, await text(tw("answer.noCitations"), "App/Caption", fg, { name: "Label" }));
    }),
    {
      path: "packages/ui/src/components/badge.tsx",
      description: "A small status pill: warn for answer warnings (not found, no citations), neutral for plain facts (stopped).",
    },
  );
  textProp(set, "Label", tw("answer.noCitations"));
  boolProp(set, "Icon", true);
  swapProp(set, "Icon", "Alert");
}

async function buildCard() {
  const set = await variantSet(
    "Card",
    listOf([{ background: "surface" }, { background: "raised" }], async (c, { background }) => {
      setup(c, { dir: "col", gap: 8, pad: 16, radius: "lg", fill: background === "raised" ? "card-raised" : "surface", stroke: "border", w: 320 });
      add(c, await text(tl("home", "strengths.items.checkable.title"), "App/Body Semibold", "fg", { name: "Content", w: "fill" }));
    }),
    {
      path: "packages/ui/src/components/card.tsx",
      description:
        "A bordered block (rounded-lg, border, surface). The padding inside belongs to the caller (16 here as an example). background=raised is the card on the landing page's panel sections (--card-bg: card-raised).",
    },
  );
  textProp(set, "Content", tl("home", "strengths.items.checkable.title"));
}

// ---------------------------------------------------------------------------------------------

async function buildThemePill() {
  const list = [];
  for (const orientation of ["vertical", "horizontal"]) for (const dark of ["true", "false"]) list.push({ orientation, dark });
  await variantSet(
    "ThemePill",
    listOf(list, async (c, { orientation, dark }) => {
      const vertical = orientation === "vertical";
      setup(c, {
        dir: vertical ? "col" : "row",
        pad: 2,
        align: "center",
        justify: "between",
        radius: "full",
        fill: "surface",
        stroke: "border",
        w: vertical ? 32 : 56,
        h: vertical ? 56 : 32,
      });
      for (const [name, on] of [
        ["Moon", dark === "true"],
        ["Sun", dark === "false"],
      ]) {
        const cell = frame(`${name} cell`, { dir: "row", w: 24, h: 24, align: "center", justify: "center", radius: "full", fill: on ? "accent" : undefined });
        add(cell, icon(name, 14, on ? "accent-fg" : "muted", `Icon/${name}`));
        add(c, cell);
      }
    }),
    {
      path: "packages/ui/src/components/theme-pill.tsx",
      description: "The light/dark switch: moon first, sun second, the accent thumb on the current theme. vertical (32x56) in the app rail, horizontal (56x32) in a header bar.",
    },
  );
}

async function buildDivider() {
  await component(
    "Divider",
    (c) => setup(c, { dir: "row", fill: "border", w: 320, h: 1 }),
    { path: "packages/ui/src/components/divider.tsx", description: "A 1px line in the border colour between two parts of a view. Spacing around it comes from the parent." },
  );
}

async function buildSpinner() {
  const c = await component(
    "Spinner",
    async (c) => {
      setup(c, { dir: "row", gap: 8, align: "center" });
      add(c, icon("Spinner", 18, "muted", "Icon"));
      const wrap = frame("Show label", { dir: "row" });
      add(wrap, await text(tw("chat.searching"), "App/Body", "muted", { name: "Label" }));
      add(c, wrap);
    },
    { path: "packages/ui/src/components/spinner.tsx", description: "A loading indicator with its text. The code can hide the text visually (hideLabel); here turn off Show label." },
  );
  textProp(c, "Label", tw("chat.searching"));
  boolProp(c, "Show label", true);
}

// ---------------------------------------------------------------------------------------------
// TextLink (text-link.tsx)

const LINK = {
  text: { t: "med", fg: "fg", underline: true },
  quiet: { t: "reg", fg: "muted", hover: { fg: "fg", underline: true }, minH: 24, pad: [4, 0] },
  band: { t: "reg", fg: "band-muted", hover: { fg: "band-fg", underline: true }, minH: 24, pad: [4, 8], fill: "band" },
  arrow: { t: "med", fg: "fg", hover: { underline: true }, minH: 24, pad: [4, 0], arrow: true },
};

async function buildTextLink() {
  const list = [];
  for (const variant of Object.keys(LINK)) for (const state of ["default", "hover", "focus"]) list.push({ variant, state });
  const set = await variantSet(
    "TextLink",
    listOf(list, async (c, { variant, state }) => {
      const v = LINK[variant];
      const h = state === "hover" ? v.hover || {} : {};
      const fg = h.fg || v.fg;
      setup(c, { dir: "row", gap: 8, align: "center", pad: v.pad, minH: v.minH, radius: "sm", fill: v.fill });
      if (state === "focus") ring(c);
      add(c, await text(tl("home", "strengths.items.checkable.link"), v.t === "med" ? "App/Body Medium" : "App/Body", fg, { name: "Label", underline: !!(v.underline || h.underline) }));
      if (v.arrow) add(c, icon("ArrowRight", 18, fg, "Icon"));
    }),
    {
      columns: 3,
      path: "packages/ui/src/components/text-link.tsx",
      description:
        'A link that is text, not a button: text (in a sentence, always underlined), quiet (a list of links), band (on the dark band, shown here on it), arrow ("learn more" with an arrow). The accent underline of the text variant is drawn in the text colour: Figma cannot colour an underline.',
    },
  );
  textProp(set, "Label", tl("home", "strengths.items.checkable.link"));
}

// ---------------------------------------------------------------------------------------------

async function buildSkipLink() {
  const set = await component(
    "SkipLink",
    async (c) => {
      setup(c, { dir: "row", pad: [8, 12], radius: "md", fill: "accent" });
      add(c, await text(tw("app.skipToContent"), "App/Text Base", "accent-fg", { name: "Label" }));
    },
    { path: "packages/ui/src/components/skip-link.tsx", description: "The first focusable element of a page. Invisible until it gets keyboard focus, then it appears in the top left corner; this is that focused state." },
  );
  textProp(set, "Label", tw("app.skipToContent"));
}

async function buildHighlighted() {
  const sentence = tw("start.example1");
  const needle = "conclusions";
  const i = sentence.indexOf(needle);
  const [before, match, after] = i < 0 ? ["", sentence, ""] : [sentence.slice(0, i), needle, sentence.slice(i + needle.length)];
  const set = await component(
    "Highlighted",
    async (c) => {
      setup(c, { dir: "row", align: "center" });
      add(c, await text(before, "App/Body", "fg", { name: "Before" }));
      const mark = frame("Mark", { dir: "row", pad: [0, 2], fill: "mark", radius: "sm" });
      add(mark, await text(match, "App/Body", "mark-fg", { name: "Match" }));
      add(c, mark);
      add(c, await text(after, "App/Body", "fg", { name: "After" }));
    },
    { path: "packages/ui/src/components/highlighted.tsx", description: "Text with every occurrence of a search word marked (mark / mark-fg), as in the chunk filter of a document." },
  );
  textProp(set, "Before", before);
  textProp(set, "Match", match);
  textProp(set, "After", after);
}

export async function buildCoreComponents() {
  await buildButton();
  await buildIconButton();
  await buildBadge();
  await buildCard();
  await buildForms();
  await buildThemePill();
  await buildDivider();
  await buildSpinner();
  await buildTextLink();
  await buildSkipLink();
  await buildHighlighted();
  await buildOverlays();
}
