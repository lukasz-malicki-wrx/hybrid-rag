/**
 * Components: how they are made, registered, documented and used.
 *
 * A component is built once on the Design System page and used everywhere else as an instance:
 *
 *   const set = await variants("Button", [
 *     { props: { variant: "primary", size: "md", state: "default" }, build: (c) => drawButton(c, ...) },
 *     ...
 *   ], { path: "packages/ui/src/components/button.tsx", description: "..." });
 *   textProp(set, "Label", "Button");          // text layers named "Label" become an editable property
 *   boolProp(set, "Icon left", false);         // layers named "Icon left" can be shown/hidden
 *   swapProp(set, "Icon left", "Plus");        // instances named "Icon left" can be swapped for another icon
 *
 *   const b = instance("Button", { variant: "primary", size: "md", state: "default", Label: "Ask" });
 *
 * The builder receives an empty ComponentNode that is already an auto layout frame (vertical by
 * default; set c.layoutMode etc. or use setup(c, {...}) with the same options as frame()).
 */
import { fill, noFill, padding, radius, space, stroke, strokeSides } from "./tokens.js";
import { add, frame, text } from "./layout.js";

const REGISTRY = new Map(); // name -> ComponentNode | ComponentSetNode
let docTarget = null; // the frame where documented components are placed

export function setDocTarget(node) {
  docTarget = node;
}

const JUSTIFY = { start: "MIN", center: "CENTER", end: "MAX", between: "SPACE_BETWEEN" };
const ALIGN = { start: "MIN", center: "CENTER", end: "MAX", baseline: "BASELINE", stretch: "MIN" };

/** Applies frame()-like options to an existing frame or component (dir, gap, pad, align, justify, fill, stroke, radius, w, h). */
export function setup(node, o = {}) {
  const dir = o.dir || "col";
  if (dir === "none") node.layoutMode = "NONE";
  else {
    node.layoutMode = dir === "row" ? "HORIZONTAL" : "VERTICAL";
    node.primaryAxisSizingMode = "AUTO";
    node.counterAxisSizingMode = "AUTO";
    if (o.gap === "auto") node.primaryAxisAlignItems = "SPACE_BETWEEN";
    else if (o.gap !== undefined) space(node, "itemSpacing", o.gap);
    if (o.justify) node.primaryAxisAlignItems = JUSTIFY[o.justify];
    if (o.align) {
      if (!ALIGN[o.align]) throw new Error(`${node.name}: align "${o.align}"`);
      node.counterAxisAlignItems = ALIGN[o.align];
    }
    if (o.justify && !JUSTIFY[o.justify]) throw new Error(`${node.name}: justify "${o.justify}"`);
    if (o.wrap) {
      node.layoutWrap = "WRAP";
      space(node, "counterAxisSpacing", o.rowGap !== undefined ? o.rowGap : o.gap || 0);
    }
    if (o.pad !== undefined) padding(node, o.pad);
  }
  if (o.fill) fill(node, o.fill, o.fillOpacity === undefined ? 1 : o.fillOpacity);
  else noFill(node);
  if (o.stroke) {
    const s = typeof o.stroke === "string" ? { role: o.stroke } : o.stroke;
    if (s.sides) strokeSides(node, s.role, s.sides, s.weight || 1);
    else stroke(node, s.role, s.weight || 1, s.align || "INSIDE");
  }
  if (o.radius) radius(node, o.radius, o.corners);
  if (typeof o.w === "number") {
    node.resize(o.w, node.height);
    node.counterAxisSizingMode = node.layoutMode === "VERTICAL" ? "FIXED" : node.counterAxisSizingMode;
    if (node.layoutMode === "HORIZONTAL") node.primaryAxisSizingMode = "FIXED";
  }
  if (typeof o.h === "number") {
    node.resize(node.width, o.h);
    if (node.layoutMode === "HORIZONTAL") node.counterAxisSizingMode = "FIXED";
    if (node.layoutMode === "VERTICAL") node.primaryAxisSizingMode = "FIXED";
  }
  if (o.minW !== undefined) node.minWidth = o.minW;
  if (o.maxW !== undefined) node.maxWidth = o.maxW;
  if (o.minH !== undefined) node.minHeight = o.minH;
  if (o.clip !== undefined) node.clipsContent = o.clip;
  return node;
}

function variantName(props) {
  return Object.entries(props)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
}

function describe(node, o) {
  const parts = [];
  if (o.description) parts.push(o.description);
  if (o.path) parts.push(`Code: ${o.path}`);
  node.description = parts.join("\n\n");
}

/** A single component (no variants). build(component) draws into it. */
export async function component(name, build, o = {}) {
  if (REGISTRY.has(name)) throw new Error(`Component "${name}" is defined twice`);
  const c = figma.createComponent();
  c.name = name;
  setup(c, { dir: "col" });
  const started = Date.now();
  try {
    await build(c);
  } catch (e) {
    throw new Error(`${name}: ${e && e.message ? e.message : e}`);
  }
  if (!name.startsWith("Icon/")) console.log(`[hybrid-rag] ${name}: done in ${Date.now() - started} ms`);
  describe(c, o);
  REGISTRY.set(name, c);
  if (o.doc !== false) await document(name, c, o);
  return c;
}

/**
 * A component set. list: [{ props: { variant: "primary", state: "hover" }, build: async (c) => {} }].
 * Variant values are lowercase words as in the code (variant="primary"); property names too.
 * o.columns: how many variants per row in the grid (default: the number of values of the first property).
 */
export async function variants(name, list, o = {}) {
  if (REGISTRY.has(name)) throw new Error(`Component "${name}" is defined twice`);
  const started = Date.now();
  console.log(`[hybrid-rag] ${name}: ${list.length} variants…`);
  const comps = [];
  for (const v of list) {
    if (Date.now() - started > 5000 && comps.length % 5 === 0) console.log(`[hybrid-rag] ${name}: variant ${comps.length + 1}/${list.length} ${variantName(v.props)} (${Date.now() - started} ms)`);
    const c = figma.createComponent();
    c.name = variantName(v.props);
    setup(c, { dir: "col" });
    try {
      await v.build(c, v.props);
    } catch (e) {
      throw new Error(`${name} [${variantName(v.props)}]: ${e && e.message ? e.message : e}`);
    }
    comps.push(c);
  }
  const holder = docTarget || figma.currentPage;
  const set = figma.combineAsVariants(comps, holder);
  set.name = name;
  // Lay the variants out in a grid with auto layout on the set itself.
  const firstKey = Object.keys(list[0].props)[0];
  const columns = o.columns || new Set(list.map((v) => v.props[firstKey])).size;
  set.layoutMode = "HORIZONTAL";
  set.layoutWrap = "WRAP";
  set.primaryAxisSizingMode = "FIXED";
  set.counterAxisSizingMode = "AUTO";
  set.itemSpacing = 24;
  set.counterAxisSpacing = 24;
  set.paddingTop = set.paddingBottom = set.paddingLeft = set.paddingRight = 24;
  const widest = Math.max(...comps.map((c) => c.width));
  set.resize(Math.max(200, columns * widest + (columns - 1) * 24 + 48), set.height);
  set.counterAxisAlignItems = "CENTER";
  set.strokes = [{ type: "SOLID", color: { r: 0.592, g: 0.278, b: 1 } }];
  set.dashPattern = [6, 4];
  set.strokeWeight = 1;
  set.cornerRadius = 8;
  describe(set, o);
  REGISTRY.set(name, set);
  console.log(`[hybrid-rag] ${name}: done in ${Date.now() - started} ms`);
  if (o.doc !== false) await document(name, set, o);
  return set;
}

/** The name of the show/hide property of a layer that also has a swap property: "Icon left" -> "Show icon left". */
function showName(layerName) {
  return `Show ${layerName.charAt(0).toLowerCase()}${layerName.slice(1)}`;
}

function variantsOf(node) {
  return node.type === "COMPONENT_SET" ? node.children : [node];
}

function findAllNamed(root, layerName) {
  return root.findAll((n) => n.name === layerName);
}

/** Makes every text layer called `layerName` an editable text property of the component (set). */
export function textProp(node, layerName, defaultValue) {
  const key = node.addComponentProperty(layerName, "TEXT", defaultValue);
  for (const v of variantsOf(node)) {
    for (const t of findAllNamed(v, layerName)) if (t.type === "TEXT") t.componentPropertyReferences = { characters: key };
  }
  return key;
}

/** Makes every layer called `layerName` a show/hide property. */
export function boolProp(node, layerName, defaultValue = true) {
  const key = node.addComponentProperty(layerName, "BOOLEAN", defaultValue);
  for (const v of variantsOf(node)) {
    for (const n of findAllNamed(v, layerName)) {
      n.componentPropertyReferences = Object.assign({}, n.componentPropertyReferences, { visible: key });
      n.visible = defaultValue;
    }
  }
  return key;
}

/** Makes every icon instance called `layerName` swappable; preferred values are all icons. */
export function swapProp(node, layerName, defaultIcon) {
  const def = get(`Icon/${defaultIcon}`);
  const preferred = [...REGISTRY.entries()].filter(([n]) => n.startsWith("Icon/")).map(([, c]) => ({ type: "COMPONENT", key: c.key }));
  // Figma keeps property names unique: a boolean on the same layer becomes "Show <layer>".
  const defs = node.componentPropertyDefinitions;
  for (const [k, d] of Object.entries(defs)) {
    if (k.split("#")[0] === layerName && d.type === "BOOLEAN") node.editComponentProperty(k, { name: showName(layerName) });
  }
  const key = node.addComponentProperty(layerName, "INSTANCE_SWAP", def.id, { preferredValues: preferred });
  for (const v of variantsOf(node)) {
    for (const n of findAllNamed(v, layerName)) {
      if (n.type === "INSTANCE") n.componentPropertyReferences = Object.assign({}, n.componentPropertyReferences, { mainComponent: key });
    }
  }
  return key;
}

export function get(name) {
  const c = REGISTRY.get(name);
  if (!c) throw new Error(`Component "${name}" is not defined (yet). Defined: ${[...REGISTRY.keys()].filter((n) => !n.startsWith("Icon/")).join(", ")}`);
  return c;
}

export function has(name) {
  return REGISTRY.has(name);
}

export function register(name, node) {
  REGISTRY.set(name, node);
}

/**
 * An instance. props mixes variant values ({ variant: "primary" }) and component properties by
 * their name ({ Label: "Ask", "Icon left": true }); an INSTANCE_SWAP property takes an icon name
 * ({ "Icon left": "Plus" } when the property is a swap; use the boolean of the same layer to show it).
 */
export function instance(name, props = {}) {
  const main = get(name);
  let target = main;
  const variantProps = {};
  const otherProps = {};
  if (main.type === "COMPONENT_SET") {
    const defs = main.componentPropertyDefinitions;
    for (const [k, v] of Object.entries(props)) {
      if (defs[k] && defs[k].type === "VARIANT") variantProps[k] = String(v);
      else otherProps[k] = v;
    }
    const match = main.children.find((c) => Object.entries(variantProps).every(([k, v]) => c.variantProperties[k] === v));
    if (!match) throw new Error(`${name}: no variant ${variantName(variantProps)}. Variants: ${main.children.map((c) => c.name).join(" | ")}`);
    target = match;
  } else Object.assign(otherProps, props);
  const inst = target.createInstance();
  setProps(inst, otherProps);
  return inst;
}

/** Sets component properties on an instance by their plain names (Label, Icon left ...). */
export function setProps(inst, props) {
  if (!Object.keys(props).length) return inst;
  const current = inst.componentProperties;
  const out = {};
  const find = (names, type) => Object.keys(current).find((key) => names.includes(key.split("#")[0]) && current[key].type === type);
  for (const [k, v] of Object.entries(props)) {
    const swap = find([k], "INSTANCE_SWAP");
    const bool = typeof v === "boolean" ? find([k, showName(k)], "BOOLEAN") : null;
    const textKey = typeof v === "string" ? find([k], "TEXT") : null;
    if (typeof v === "string" && swap && has(`Icon/${v}`)) out[swap] = get(`Icon/${v}`).id;
    else if (bool) out[bool] = v;
    else if (textKey) out[textKey] = v;
    else throw new Error(`${inst.name}: no property "${k}". Properties: ${Object.keys(current).map((key) => key.split("#")[0]).join(", ")}`);
  }
  for (const [key, value] of Object.entries(out)) {
    try {
      inst.setProperties({ [key]: value });
    } catch (e) {
      const type = current[key] && current[key].type;
      throw new Error(`setProps on ${inst.name}: ${key} (${type}) = ${JSON.stringify(value)}: ${e && e.message ? e.message : e}`);
    }
  }
  return inst;
}

// ---------------------------------------------------------------------------------------------
// Documentation blocks on the Design System page: title, description, code path, then the component.

async function document(name, node, o) {
  if (!docTarget || name.startsWith("Icon/")) return;
  const block = frame(`Doc · ${name}`, { dir: "col", gap: 16, pad: 32, fill: "bg", radius: "xl", stroke: "border" });
  add(block, await text(name, "App/Heading LG", "fg"));
  if (o.description) add(block, await text(o.description, "App/Body", "muted", { w: 560 }));
  if (o.path) add(block, await text(o.path, "App/Caption", "muted"));
  add(docTarget, block);
  add(block, node);
}
