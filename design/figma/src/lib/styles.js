/**
 * Text and effect styles. Names say where a style is used, sizes come from the code:
 *  - App/*: packages/ui heading.tsx and text.tsx (Tailwind sizes and line heights).
 *  - Landing/*: the fluid type scale of apps/landing globals.css, at 1440 px (Desktop) and 375 px (Mobile).
 * Text never goes below 12 px (WCAG 2.1 AA is a requirement of the project).
 */
import { DATA } from "../generated/data.js";

export const FONT = "Inter";
export const WEIGHTS = { 400: "Regular", 500: "Medium", 600: "Semi Bold", 700: "Bold" };

export async function loadFonts() {
  for (const style of Object.values(WEIGHTS)) await figma.loadFontAsync({ family: FONT, style });
}

const S = {}; // style name -> TextStyle
const E = {}; // effect style name -> EffectStyle

function def(name, size, lineHeightPx, weight, opts = {}) {
  return { name, size, lineHeight: lineHeightPx, weight, ...opts };
}

/** Every text style. `lineHeight` is in px, `letterSpacing` in percent, `upper` for capitals. */
function textStyleDefs() {
  const defs = [
    // App (packages/ui): heading sizes
    def("App/Bar", 20, 28, 700, { description: 'Heading size="bar": the title of a pane bar' }),
    def("App/Title", 16, 24, 700, { description: 'Heading size="title"' }),
    def("App/Heading XL", 30, 36, 600, { description: 'Heading size="xl" (24 on phones)' }),
    def("App/Heading LG", 24, 32, 600, { description: 'Heading size="lg"' }),
    def("App/Heading MD", 18, 28, 600, { description: 'Heading size="md"' }),
    def("App/Heading SM", 16, 24, 600, { description: 'Heading size="sm"' }),
    def("App/Caption Heading", 14, 20, 500, { description: 'Heading size="caption"' }),
    def("App/Overline", 12, 16, 600, { upper: true, letterSpacing: 2.5, description: 'Heading size="overline"' }),
    // App: running text
    def("App/Text Base", 16, 24, 400, { description: 'Text size="base"' }),
    def("App/Body", 14, 20, 400, { description: 'Text size="sm": messages, lists, inputs' }),
    def("App/Body Medium", 14, 20, 500),
    def("App/Body Semibold", 14, 20, 600),
    def("App/Message", 14, 22, 400, { description: "Answer and question text (leading-relaxed)" }),
    def("App/Caption", 12, 16, 400, { description: 'Text size="xs": times, counters, hints' }),
    def("App/Caption Medium", 12, 16, 500),
    def("App/Caption Semibold", 12, 16, 600),
    def("App/Preview", 12, 18, 400, { description: "The two-line preview of a chat in the list" }),
  ];
  const L = DATA.landing.scale;
  const landing = [
    ["H1", "h1", 600],
    ["H2", "h2", 600],
    ["H3", "h3", 600],
    ["Lead", "lead", 400],
    ["Eyebrow", "eyebrow", 400],
    ["Stat", "stat", 600],
  ];
  for (const [label, key, weight] of landing) {
    for (const bp of ["Desktop", "Mobile"]) {
      const s = L[key];
      const size = s[bp.toLowerCase()];
      defs.push(
        def(`Landing/${label} ${bp}`, size, Math.round(size * s.lineHeight), weight, {
          letterSpacing: s.letterSpacing,
          description: `text-${key} at ${bp === "Desktop" ? 1440 : 375}px (apps/landing/src/app/globals.css)`,
        }),
      );
    }
  }
  defs.push(
    def("Landing/Body Desktop", 18, 27, 400, { description: "A paragraph: 18/27 at 1440px" }),
    def("Landing/Body Mobile", 16, 24, 400, { description: "A paragraph: 16/24 on a phone" }),
    def("Landing/Nav", 14, 20, 500, { description: "Header links" }),
    def("Landing/Small", 14, 20, 400, { description: "Footer and captions" }),
  );
  return defs;
}

function rgba(r, g, b, a) {
  return { r: r / 255, g: g / 255, b: b / 255, a };
}

function shadow(x, y, blur, spread, color) {
  return { type: "DROP_SHADOW", offset: { x, y }, radius: blur, spread, color, visible: true, blendMode: "NORMAL", showShadowBehindNode: false };
}

function effectStyleDefs() {
  const black = (a) => rgba(0, 0, 0, a);
  return [
    { name: "Shadow/SM", description: "shadow-sm: the selected tab", effects: [shadow(0, 1, 3, 0, black(0.1)), shadow(0, 1, 2, -1, black(0.1))] },
    { name: "Shadow/LG", description: "shadow-lg: toasts, menus", effects: [shadow(0, 10, 15, -3, black(0.1)), shadow(0, 4, 6, -4, black(0.1))] },
    { name: "Shadow/XL", description: "shadow-xl: dialogs", effects: [shadow(0, 20, 25, -5, black(0.1)), shadow(0, 8, 10, -6, black(0.1))] },
    { name: "Shadow/Header", description: "--shadow-header: the landing header and its menus", effects: [shadow(0, 1, 2, 0, black(0.05)), shadow(0, 8, 24, -8, black(0.12))] },
    { name: "Shadow/Composer", description: "The message box: 0 19px 29px rgb(30 31 34 / .05)", effects: [shadow(0, 19, 29, 0, rgba(30, 31, 34, 0.05))] },
  ];
}

async function removeOurStyles() {
  for (const s of await figma.getLocalTextStylesAsync()) if (/^(App|Landing)\//.test(s.name)) s.remove();
  for (const s of await figma.getLocalEffectStylesAsync()) if (/^Shadow\//.test(s.name)) s.remove();
}

export async function setupStyles() {
  await removeOurStyles();
  for (const d of textStyleDefs()) {
    const s = figma.createTextStyle();
    s.name = d.name;
    s.fontName = { family: FONT, style: WEIGHTS[d.weight] };
    s.fontSize = d.size;
    s.lineHeight = { value: d.lineHeight, unit: "PIXELS" };
    s.letterSpacing = { value: d.letterSpacing || 0, unit: "PERCENT" };
    if (d.upper) s.textCase = "UPPER";
    if (d.description) s.description = d.description;
    S[d.name] = s;
  }
  for (const d of effectStyleDefs()) {
    const s = figma.createEffectStyle();
    s.name = d.name;
    s.effects = d.effects;
    s.description = d.description;
    E[d.name] = s;
  }
}

export function textStyle(name) {
  const s = S[name];
  if (!s) throw new Error(`Unknown text style "${name}". Styles: ${Object.keys(S).join(", ")}`);
  return s;
}

export function effectStyle(name) {
  const s = E[name];
  if (!s) throw new Error(`Unknown effect style "${name}". Styles: ${Object.keys(E).join(", ")}`);
  return s;
}

export function allTextStyles() {
  return Object.values(S);
}

export function allEffectStyles() {
  return Object.values(E);
}
