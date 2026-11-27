/**
 * Helpers of the landing screens: a page frame, a section (full-width band with the page container
 * inside), blocks with the code's margins, columns and grids, and plain texts in the right style.
 * Screens contain only instances of the landing components, these layout frames and texts.
 */
import { instance } from "../../lib/components.js";
import { add, frame, size, text } from "../../lib/layout.js";
import { icon } from "../../lib/icons.js";
import { layoutSpace, space } from "../../lib/tokens.js";
import { CONTENT_W, lt, MARGIN, PAGE_W } from "../../components/landing/shared.js";

export { CONTENT_W, lt, MARGIN, PAGE_W };

/** Binds a padding or gap: a spacing variable for a number, a landing layout size for a name. */
export function bindSpace(node, field, spec, bp) {
  if (!spec) return node;
  if (typeof spec === "number") return space(node, field, spec);
  if (spec === "heading-60") return layoutSpace(node, field, "heading", "desktop"); // mt-15: 60 whatever the width
  const name = { section: "section", tight: "section-tight", heading: "heading" }[spec];
  return layoutSpace(node, field, name, bp);
}

export function pageFrame(bp) {
  return frame("Page", { dir: "col", w: PAGE_W[bp], fill: "bg" });
}

export function addInstance(parent, name, props, o = {}) {
  const inst = instance(name, props);
  add(parent, inst);
  if (o.fill) size(inst, "fill", o.fillV ? "fill" : undefined);
  return inst;
}

/**
 * A full-width section: `outer` carries the colour (panel) and the vertical padding (py-section:
 * "section" | "tight" | a number | 0, per side), `inner` is the page container (side margins) in which
 * the content goes. `gap` is the space between the blocks of the container.
 */
export function section(parent, bp, o = {}) {
  const outer = frame(o.name || "Section", { dir: "col", w: "fill", fill: o.tone === "panel" ? "panel" : undefined, gap: o.outerGap });
  bindSpace(outer, "paddingTop", o.top === undefined ? "section" : o.top, bp);
  bindSpace(outer, "paddingBottom", o.bottom === undefined ? "section" : o.bottom, bp);
  const inner = frame("Container", { dir: "col", w: "fill", pad: [0, MARGIN[bp]], gap: o.gap, align: o.align });
  add(outer, inner);
  add(parent, outer);
  return { outer, inner };
}

/** A block with `mt` above it (the code's margin-top as the padding of a wrapper). */
export function block(parent, bp, top, o = {}) {
  const b = frame(o.name || "Block", { dir: o.dir || "col", gap: o.gap, w: "fill", align: o.align, justify: o.justify });
  bindSpace(b, "paddingTop", top, bp);
  add(parent, b);
  return b;
}

/** Equal columns: a row whose children fill it equally. */
export function columns(parent, gap, o = {}) {
  const row = frame(o.name || "Columns", { dir: "row", gap, w: "fill", align: o.align || "start" });
  add(parent, row);
  return row;
}

/** A grid of `count` equal columns of the given items (instances or frames), stretched to the row height. */
export function grid(parent, bp, items, o) {
  const { cols, gap, rowGap = gap, name = "Grid" } = o;
  const g = frame(name, { dir: "col", gap: rowGap, w: "fill" });
  if (o.maxW) g.maxWidth = o.maxW;
  add(parent, g);
  for (let i = 0; i < items.length; i += cols) {
    const row = frame("Row", { dir: "row", gap, w: "fill" });
    add(g, row);
    const chunk = items.slice(i, i + cols);
    while (chunk.length < cols) chunk.push(frame("Empty cell", { dir: "col" }));
    for (const item of chunk) {
      add(row, item);
      size(item, "fill", "fill");
    }
  }
  return g;
}

export function cell(parent, node, h = false) {
  add(parent, node);
  size(node, "fill", h ? "fill" : undefined);
  return node;
}

// ---------------------------------------------------------------------------------------------
// Texts

const STYLES = { base: "App/Text Base", sm: "App/Body", xs: "App/Caption" };

/** A paragraph: size base | sm | lead; tone fg | muted. Fills its parent's width. */
export async function para(content, bp, o = {}) {
  const style = o.size === "lead" ? lt("Lead", bp) : o.style || STYLES[o.size || "base"];
  const t = await text(content, style, o.role || (o.muted ? "muted" : "fg"), { name: o.name, w: o.w || "fill", align: o.align });
  return t;
}

/** A heading in the landing scale (h1 | h2 | h3). */
export async function heading(content, bp, level, o = {}) {
  return text(content, lt(level.toUpperCase(), bp), o.role || "fg", { name: o.name, w: o.w || "fill", align: o.align });
}

/** Adds a text to a parent and caps its width (max-w-copy: 32em of its own size). */
export async function addPara(parent, content, bp, o = {}) {
  const t = await para(content, bp, o);
  add(parent, t);
  if (o.max) t.maxWidth = o.max;
  return t;
}

/** A bullet of a list (list-disc): a dot and the text. `indent` is the list's padding-left. */
export async function bullet(parent, content, bp, o = {}) {
  const row = frame("Item", { dir: "row", gap: 8, w: "fill", pad: [0, 0, 0, o.indent === undefined ? 0 : o.indent] });
  const dotWrap = frame("Bullet", { dir: "col", pad: [8, 0, 0, 0] });
  add(dotWrap, frame("Dot", { dir: "row", w: 6, h: 6, radius: "full", fill: "fg" }));
  add(row, dotWrap);
  const t = await para(content, bp, { size: o.size || "base" });
  add(row, t);
  add(parent, row);
  return row;
}

/** An arrow pointing down (the flow's arrow on a phone): the right arrow turned a quarter turn. */
export function arrowDown(size_ = 20, role = "muted") {
  const holder = frame("Arrow down", { dir: "none", w: size_, h: size_ });
  const arrow = icon("ArrowRight", size_, role, "Arrow");
  holder.appendChild(arrow);
  arrow.rotation = -90;
  arrow.x = size_;
  arrow.y = 0;
  return holder;
}
