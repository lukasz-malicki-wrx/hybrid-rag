/**
 * Variables: the single source of every colour, spacing and radius the plugin draws.
 *
 *  - "Primitives": the raw palette (vintage/light/bg, vintage/dark/bg ...). Never bound directly.
 *  - "Theme": the colour roles (color/bg, color/panel ...), aliases of the primitives. With Light and
 *    Dark modes when the plan allows two modes; otherwise two collections, "Theme · Light" and
 *    "Theme · Dark", with the same variable names (see dark.js).
 *  - "Spacing & Radius": numbers on the 4 px grid of Tailwind, and the corner radii.
 *
 * Components and screens only ever call fill(), stroke(), space() and radius() from here, so every
 * fill and gap in the file is bound to a variable. Nothing draws a raw hex value.
 */
import { DATA } from "../generated/data.js";

const PRIMITIVES = "Primitives";
const THEME = "Theme";
const THEME_LIGHT = "Theme · Light";
const THEME_DARK = "Theme · Dark";
const SIZES = "Spacing & Radius";
const OUR_COLLECTIONS = [PRIMITIVES, THEME, THEME_LIGHT, THEME_DARK, SIZES];

/** The spacing scale in px: Tailwind's steps that the code uses (p-0.5 ... p-30), plus 120 (the landing margin). */
export const SPACING = [0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 22, 24, 28, 32, 40, 48, 56, 64, 72, 80, 96, 120];
/** Corner radii, named as in Tailwind 4 (rounded-sm = 4, rounded-lg = 8 ...). */
export const RADII = { none: 0, xs: 2, sm: 4, md: 6, lg: 8, xl: 12, "2xl": 16, full: 9999 };

export const T = {
  /** "modes": one Theme collection with Light and Dark. "collections": two Theme collections. */
  strategy: "modes",
  theme: null, // the collection the light design is bound to
  themeDark: null, // in "collections" strategy: the dark twin collection
  darkModeId: null, // in "modes" strategy
  color: {}, // role name -> Variable (light / single collection)
  colorDark: {}, // role name -> Variable (dark twin collection)
  space: {}, // px -> Variable
  radius: {}, // name -> Variable
  layout: {}, // "section/desktop" ... -> Variable
};

function hexToRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

async function removeOurCollections() {
  const existing = await figma.variables.getLocalVariableCollectionsAsync();
  for (const c of existing) if (OUR_COLLECTIONS.includes(c.name)) c.remove();
}

function alias(variable) {
  return { type: "VARIABLE_ALIAS", id: variable.id };
}

export async function setupVariables() {
  await removeOurCollections();
  const { primitives, roles } = DATA.colours;

  // Primitives: one mode, every light and dark value as its own variable.
  const prim = figma.variables.createVariableCollection(PRIMITIVES);
  const primMode = prim.modes[0].modeId;
  prim.renameMode(primMode, "Value");
  const primVar = { light: {}, dark: {} };
  for (const [name, v] of Object.entries(primitives)) {
    for (const scheme of ["light", "dark"]) {
      const variable = figma.variables.createVariable(`vintage/${scheme}/${name}`, prim, "COLOR");
      variable.setValueForMode(primMode, hexToRgb(v[scheme]));
      variable.hiddenFromPublishing = true;
      primVar[scheme][name] = variable;
    }
  }

  // The dim layer under a dialog (packages/ui styles.css: dialog::backdrop rgb(0 0 0 / 0.45)), the
  // same in both themes; it is not in the palette, so it is a primitive of its own.
  const scrim = figma.variables.createVariable("overlay/scrim", prim, "COLOR");
  scrim.setValueForMode(primMode, { r: 0, g: 0, b: 0, a: 0.45 });
  scrim.description = "dialog::backdrop (packages/ui/src/styles.css)";
  scrim.hiddenFromPublishing = true;
  primVar.light["scrim"] = scrim;
  primVar.dark["scrim"] = scrim;
  const allRoles = Object.assign({}, roles, { scrim: { light: "scrim", dark: "scrim" } });

  // Theme: try one collection with two modes; fall back to twin collections.
  const theme = figma.variables.createVariableCollection(THEME);
  const lightMode = theme.modes[0].modeId;
  theme.renameMode(lightMode, "Light");
  let darkMode = null;
  try {
    darkMode = theme.addMode("Dark");
  } catch (e) {
    darkMode = null;
  }

  const describe = (role) => (role === "scrim" ? "The dim layer under a dialog: dialog::backdrop (packages/ui/src/styles.css)" : `--color-${role} (packages/design-tokens/src/theme.css)`);
  if (darkMode) {
    T.strategy = "modes";
    T.theme = theme;
    T.darkModeId = darkMode;
    for (const [role, r] of Object.entries(allRoles)) {
      const variable = figma.variables.createVariable(`color/${role}`, theme, "COLOR");
      variable.setValueForMode(lightMode, alias(primVar.light[r.light]));
      variable.setValueForMode(darkMode, alias(primVar.dark[r.dark]));
      variable.description = describe(role);
      variable.scopes = ["ALL_FILLS", "STROKE_COLOR", "EFFECT_COLOR"];
      T.color[role] = variable;
    }
  } else {
    T.strategy = "collections";
    theme.name = THEME_LIGHT;
    const dark = figma.variables.createVariableCollection(THEME_DARK);
    dark.renameMode(dark.modes[0].modeId, "Dark");
    T.theme = theme;
    T.themeDark = dark;
    for (const [role, r] of Object.entries(allRoles)) {
      const lv = figma.variables.createVariable(`color/${role}`, theme, "COLOR");
      lv.setValueForMode(lightMode, alias(primVar.light[r.light]));
      lv.description = describe(role);
      lv.scopes = ["ALL_FILLS", "STROKE_COLOR", "EFFECT_COLOR"];
      const dv = figma.variables.createVariable(`color/${role}`, dark, "COLOR");
      dv.setValueForMode(dark.modes[0].modeId, alias(primVar.dark[r.dark]));
      dv.description = describe(role);
      dv.scopes = ["ALL_FILLS", "STROKE_COLOR", "EFFECT_COLOR"];
      T.color[role] = lv;
      T.colorDark[role] = dv;
    }
  }

  // Spacing, radius and the landing layout sizes.
  const sizes = figma.variables.createVariableCollection(SIZES);
  const sizeMode = sizes.modes[0].modeId;
  sizes.renameMode(sizeMode, "Value");
  for (const px of SPACING) {
    const v = figma.variables.createVariable(`spacing/${px}`, sizes, "FLOAT");
    v.setValueForMode(sizeMode, px);
    v.scopes = ["GAP", "WIDTH_HEIGHT"];
    T.space[px] = v;
  }
  for (const [name, px] of Object.entries(RADII)) {
    const v = figma.variables.createVariable(`radius/${name}`, sizes, "FLOAT");
    v.setValueForMode(sizeMode, px);
    v.scopes = ["CORNER_RADIUS"];
    T.radius[name] = v;
  }
  for (const [name, val] of Object.entries(DATA.landing.spacing)) {
    for (const bp of ["desktop", "mobile"]) {
      const v = figma.variables.createVariable(`layout/${name}/${bp}`, sizes, "FLOAT");
      v.setValueForMode(sizeMode, val[bp]);
      v.scopes = ["GAP"];
      v.description = `--spacing-${name} (apps/landing/src/app/globals.css) at ${bp === "desktop" ? 1440 : 375}px`;
      T.layout[`${name}/${bp}`] = v;
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Binding helpers. Every component and screen uses these.

function colorVar(role) {
  const v = T.color[role];
  if (!v) throw new Error(`Unknown colour role "${role}". Roles: ${Object.keys(T.color).join(", ")}`);
  return v;
}

/** A solid paint bound to a colour role (optionally with opacity 0..1). */
export function paint(role, opacity = 1) {
  const base = { type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity };
  return figma.variables.setBoundVariableForPaint(base, "color", colorVar(role));
}

export function fill(node, role, opacity = 1) {
  node.fills = [paint(role, opacity)];
  return node;
}

export function noFill(node) {
  node.fills = [];
  return node;
}

/** A border bound to a role. align: "INSIDE" (default, like CSS border-box) | "OUTSIDE" | "CENTER". */
export function stroke(node, role, weight = 1, align = "INSIDE") {
  node.strokes = [paint(role)];
  node.strokeWeight = weight;
  node.strokeAlign = align;
  return node;
}

/** Only one side of the border (e.g. the rail's right edge): sides is any of top/right/bottom/left. */
export function strokeSides(node, role, sides, weight = 1) {
  stroke(node, role, weight, "INSIDE");
  node.strokeTopWeight = sides.includes("top") ? weight : 0;
  node.strokeRightWeight = sides.includes("right") ? weight : 0;
  node.strokeBottomWeight = sides.includes("bottom") ? weight : 0;
  node.strokeLeftWeight = sides.includes("left") ? weight : 0;
  return node;
}

function spaceVar(px) {
  const v = T.space[px];
  if (!v) throw new Error(`${px}px is not on the spacing scale (${SPACING.join(", ")})`);
  return v;
}

/**
 * Binds a numeric layout field to the spacing variable of that size. field: paddingTop,
 * paddingRight, paddingBottom, paddingLeft, itemSpacing, counterAxisSpacing, width, height,
 * minWidth, maxWidth, minHeight, maxHeight.
 */
export function space(node, field, px) {
  node.setBoundVariable(field, spaceVar(px));
  return node;
}

/** Padding in CSS order: one value, [y, x] or [top, right, bottom, left]. */
export function padding(node, value) {
  const v = Array.isArray(value) ? value : [value];
  const [t, r, b, l] = v.length === 1 ? [v[0], v[0], v[0], v[0]] : v.length === 2 ? [v[0], v[1], v[0], v[1]] : v.length === 3 ? [v[0], v[1], v[2], v[1]] : v;
  space(node, "paddingTop", t);
  space(node, "paddingRight", r);
  space(node, "paddingBottom", b);
  space(node, "paddingLeft", l);
  return node;
}

/** The gap of a landing section, which differs on a phone and on the desktop. name: section | section-tight | heading | gutter. */
export function layoutSpace(node, field, name, breakpoint) {
  const v = T.layout[`${name}/${breakpoint}`];
  if (!v) throw new Error(`No layout size ${name}/${breakpoint}`);
  node.setBoundVariable(field, v);
  return node;
}

/** Corner radius by name (none, xs, sm, md, lg, xl, 2xl, full); corners: all by default, or a list like ["topLeft","bottomLeft"]. */
export function radius(node, name, corners) {
  const v = T.radius[name];
  if (!v) throw new Error(`Unknown radius "${name}" (${Object.keys(RADII).join(", ")})`);
  const all = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
  for (const c of corners || all) node.setBoundVariable(`${c}Radius`, v);
  return node;
}

/** The resolved light value of a role as {r,g,b}, for docs (contrast ratios). */
export function resolvedHex(role, scheme = "light") {
  const r = DATA.colours.roles[role];
  return DATA.colours.primitives[r[scheme]][scheme];
}
