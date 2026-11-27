/**
 * Dark versions of screens. With two modes, a dark screen is the light one with the Theme
 * collection set to "Dark". Without (Starter plan), it is a copy whose colour bindings are moved
 * to the "Theme · Dark" collection, variable by variable (same names), and whose screenshots are
 * swapped for the dark pictures.
 */
import { T, paint } from "./tokens.js";
import { shotPaint } from "./images.js";

function rebindPaints(paints) {
  if (!Array.isArray(paints)) return paints;
  let changed = false;
  const out = paints.map((p) => {
    const b = p.boundVariables && p.boundVariables.color;
    if (!b) return p;
    const role = Object.keys(T.color).find((r) => T.color[r].id === b.id);
    if (!role) return p;
    changed = true;
    return figma.variables.setBoundVariableForPaint(p, "color", T.colorDark[role]);
  });
  return changed ? out : paints;
}

function walk(node) {
  if ("fills" in node && node.fills !== figma.mixed) {
    const next = rebindPaints(node.fills);
    if (next !== node.fills) node.fills = next;
  }
  if ("strokes" in node) {
    const next = rebindPaints(node.strokes);
    if (next !== node.strokes) node.strokes = next;
  }
  if (node.name && node.name.startsWith("Screenshot/") && "fills" in node) {
    node.fills = [shotPaint(node.name.slice("Screenshot/".length), "dark")];
  }
  if ("children" in node) for (const c of node.children) walk(c);
}

function swapScreens(node) {
  if (node.name && node.name.startsWith("Screenshot/") && "fills" in node) {
    node.fills = [shotPaint(node.name.slice("Screenshot/".length), "dark")];
  }
  if ("children" in node) for (const c of node.children) swapScreens(c);
}

/**
 * Turns a freshly built frame into its dark version in place. Screens are built twice rather than
 * cloned: a clone of a frame full of instances can lose the sizes of hugging instances in Figma.
 */
export function makeDark(frame) {
  frame.name = frame.name.replace(/ · Light$/, "") + " · Dark";
  if (T.strategy === "modes") {
    frame.setExplicitVariableModeForCollection(T.theme, T.darkModeId);
    swapScreens(frame);
  } else {
    walk(frame);
  }
  return frame;
}

/** Returns a dark copy of `frame`, placed next to it, named "<name> · Dark". */
export function darkCopy(frame, gap = 80) {
  const copy = frame.clone();
  copy.name = frame.name.replace(/ · Light$/, "") + " · Dark";
  copy.x = frame.x + frame.width + gap;
  copy.y = frame.y;
  if (T.strategy === "modes") {
    copy.setExplicitVariableModeForCollection(T.theme, T.darkModeId);
    swapScreens(copy);
  } else {
    walk(copy);
  }
  return copy;
}

/** Marks a frame as light explicitly (useful so its name says so). */
export function lightName(frame) {
  if (!/ · Light$/.test(frame.name)) frame.name = `${frame.name} · Light`;
  return frame;
}

export { paint };
