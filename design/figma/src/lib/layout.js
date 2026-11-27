/**
 * Auto layout helpers. Every frame the plugin draws is an auto layout frame built with frame(),
 * with its gaps and paddings bound to spacing variables and its colours bound to roles, so the
 * file reads like the code: flex, gap, padding, rounded, bg.
 *
 *   const card = frame("Card", { dir: "col", gap: 8, pad: [16, 20], fill: "surface", radius: "lg", stroke: "border" });
 *   add(card, await text(t.web("chat.newChat"), "App/Body Semibold"), button);
 *
 * Sizes: w / h are a number (fixed), "hug" or "fill". "fill" takes effect when the node is added
 * to an auto layout parent with add(), so always use add() rather than appendChild().
 */
import { fill as fillRole, noFill, padding, radius as radiusVar, space, stroke as strokeRole, strokeSides } from "./tokens.js";
import { effectStyle, textStyle } from "./styles.js";

const pending = new WeakMap(); // node -> { w, h } to apply once the node has an auto layout parent

const JUSTIFY = { start: "MIN", center: "CENTER", end: "MAX", between: "SPACE_BETWEEN" };
const ALIGN = { start: "MIN", center: "CENTER", end: "MAX", baseline: "BASELINE", stretch: "MIN" };
// Parents whose children stretch across the counter axis (CSS align-items: stretch): add() makes them fill.
const stretchParents = new WeakSet();

function applySizing(node, w, h, parentIsAuto) {
  const set = (axis, value) => {
    if (value === undefined) return;
    const prop = axis === "w" ? "layoutSizingHorizontal" : "layoutSizingVertical";
    if (typeof value === "number") {
      if (axis === "w") node.resize(value, node.height);
      else node.resize(node.width, value);
      if (parentIsAuto || node.layoutMode !== "NONE") node[prop] = "FIXED";
    } else if (value === "hug") {
      if (node.type === "TEXT") {
        node.textAutoResize = axis === "w" ? "WIDTH_AND_HEIGHT" : node.textAutoResize;
      } else if (parentIsAuto || node.layoutMode !== "NONE") node[prop] = "HUG";
    } else if (value === "fill") {
      if (!parentIsAuto) return false;
      if (node.type === "TEXT" && axis === "w") node.textAutoResize = "HEIGHT";
      node[prop] = "FILL";
    }
    return true;
  };
  const okW = set("w", w);
  const okH = set("h", h);
  return okW !== false && okH !== false;
}

/**
 * A frame. Options:
 *  dir: "col" (default) | "row" | "none" (free positioning, e.g. a badge on a corner)
 *  gap: px on the spacing scale, or "auto" (space-between)
 *  pad: px | [y, x] | [t, r, b, l]
 *  align: counter axis: "start" | "center" | "end" | "baseline"; justify: main axis: "start" | "center" | "end" | "between"
 *  fill: colour role or null (transparent, the default); fillOpacity
 *  stroke: role, or { role, weight, align, sides: ["right"] }
 *  radius: "lg" ... ; corners: ["topLeft", ...]
 *  w, h: number | "hug" | "fill" (default: hug both); minW, maxW, minH, maxH (px)
 *  wrap: true for a wrapping row (rowGap = gap unless rowGap given); clip: clip content
 *  effect: effect style name ("Shadow/LG"); opacity
 */
export function frame(name, o = {}) {
  const f = figma.createFrame();
  f.name = name;
  noFill(f);
  f.clipsContent = !!o.clip;
  const dir = o.dir || "col";
  if (dir !== "none") {
    f.layoutMode = dir === "row" ? "HORIZONTAL" : "VERTICAL";
    f.primaryAxisSizingMode = "AUTO";
    f.counterAxisSizingMode = "AUTO";
    if (o.gap === "auto") f.primaryAxisAlignItems = "SPACE_BETWEEN";
    else if (o.gap !== undefined) space(f, "itemSpacing", o.gap);
    if (o.justify) f.primaryAxisAlignItems = JUSTIFY[o.justify];
    if (o.align) {
      if (!ALIGN[o.align]) throw new Error(`${name}: align "${o.align}" (start | center | end | baseline | stretch)`);
      f.counterAxisAlignItems = ALIGN[o.align];
      if (o.align === "stretch") stretchParents.add(f);
    }
    if (o.justify && !JUSTIFY[o.justify]) throw new Error(`${name}: justify "${o.justify}" (start | center | end | between)`);
    if (o.wrap) {
      f.layoutWrap = "WRAP";
      space(f, "counterAxisSpacing", o.rowGap !== undefined ? o.rowGap : o.gap || 0);
    }
    if (o.pad !== undefined) padding(f, o.pad);
  }
  if (o.fill) fillRole(f, o.fill, o.fillOpacity === undefined ? 1 : o.fillOpacity);
  if (o.stroke) {
    const s = typeof o.stroke === "string" ? { role: o.stroke } : o.stroke;
    if (s.sides) strokeSides(f, s.role, s.sides, s.weight || 1);
    else strokeRole(f, s.role, s.weight || 1, s.align || "INSIDE");
  }
  if (o.radius) radiusVar(f, o.radius, o.corners);
  if (o.opacity !== undefined) f.opacity = o.opacity;
  if (o.minW !== undefined) f.minWidth = o.minW;
  if (o.maxW !== undefined) f.maxWidth = o.maxW;
  if (o.minH !== undefined) f.minHeight = o.minH;
  if (o.maxH !== undefined) f.maxHeight = o.maxH;
  if (o.effect) pendingEffects.push([f, o.effect]);
  if (!applySizing(f, o.w, o.h, false)) pending.set(f, { w: o.w, h: o.h });
  else if (o.w === "fill" || o.h === "fill") pending.set(f, { w: o.w, h: o.h });
  return f;
}

const pendingEffects = [];

/** Applies the effect styles requested through frame({ effect }). Called once by main.js (and safe to call any time). */
export async function flushEffects() {
  while (pendingEffects.length) {
    const [node, name] = pendingEffects.shift();
    if (!node.removed) await node.setEffectStyleIdAsync(effectStyle(name).id);
  }
}

/** Gives a node an effect style now. */
export async function shadow(node, styleName) {
  await node.setEffectStyleIdAsync(effectStyle(styleName).id);
  return node;
}

/**
 * A text layer with a text style and a colour role. Options: w ("hug" default | "fill" | px),
 * align ("LEFT" | "CENTER" | "RIGHT"), maxLines (truncates with an ellipsis), name, underline.
 */
export async function text(content, styleName, role = "fg", o = {}) {
  const t = figma.createText();
  const style = textStyle(styleName);
  await t.setTextStyleIdAsync(style.id);
  t.characters = String(content);
  t.name = o.name || String(content).slice(0, 40);
  fillRole(t, role, o.opacity === undefined ? 1 : o.opacity);
  if (o.align) t.textAlignHorizontal = o.align;
  if (o.maxLines) {
    t.textTruncation = "ENDING";
    t.maxLines = o.maxLines;
  }
  if (o.underline) t.textDecoration = "UNDERLINE";
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  const w = o.w || "hug";
  if (typeof w === "number") {
    t.textAutoResize = "HEIGHT";
    t.resize(w, t.height);
  } else if (w === "fill") pending.set(t, { w: "fill" });
  return t;
}

/** Appends children to an auto layout parent and applies their "fill" sizes. Returns the parent. */
export function add(parent, ...children) {
  for (const child of children.flat()) {
    if (!child) continue;
    parent.appendChild(child);
    if (stretchParents.has(parent) && child.type !== "TEXT") {
      const counter = parent.layoutMode === "VERTICAL" ? "w" : "h";
      if (!pending.has(child)) pending.set(child, {});
      const p0 = pending.get(child);
      if (p0[counter] === undefined) p0[counter] = "fill";
    }
    const p = pending.get(child);
    if (p && parent.layoutMode && parent.layoutMode !== "NONE") {
      applySizing(child, p.w, p.h, true);
      pending.delete(child);
    }
  }
  return parent;
}

/** Sets a node's size behaviour after creation (e.g. an instance that should fill its row). */
export function size(node, w, h) {
  const parentIsAuto = !!(node.parent && node.parent.layoutMode && node.parent.layoutMode !== "NONE");
  if (!applySizing(node, w, h, parentIsAuto)) pending.set(node, { w, h });
  return node;
}

/** A free spacer of fixed size (rarely needed: prefer gap). */
export function spacer(px, axis = "h") {
  const f = figma.createFrame();
  f.name = "Spacer";
  noFill(f);
  f.resize(axis === "h" ? 1 : px, axis === "h" ? px : 1);
  return f;
}

/** A 1px line in the border colour (horizontal by default) that fills its parent. */
export function rule(role = "border", vertical = false) {
  const r = figma.createFrame();
  r.name = "Divider";
  fillRole(r, role);
  r.resize(vertical ? 1 : 100, vertical ? 100 : 1);
  pending.set(r, vertical ? { h: "fill" } : { w: "fill" });
  return r;
}
