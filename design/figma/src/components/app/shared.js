/** Helpers shared by the app component files. */
import { instance, setProps } from "../../lib/components.js";

export { STATES, STYLE, ring, listOf, variantSet } from "../core/shared.js";

const WEB = "apps/web/src/features/";
export const src = (file) => `${WEB}${file}`;

/** An instance with a layer name (so a screen reads "Sources button", not "Button"). */
export function inst(name, props = {}, layerName) {
  const i = instance(name, props);
  if (layerName) i.name = layerName;
  return i;
}

/** A core Button instance, optionally with a leading icon. */
export function button(variant, size, label, o = {}) {
  const b = instance("Button", { variant, size, state: o.state || "default", Label: label });
  if (o.icon) {
    setProps(b, { "Icon left": o.icon });
    setProps(b, { "Icon left": true });
  }
  b.name = o.name || `${label} button`;
  return b;
}

/** A core IconButton instance with its icon. */
export function iconBtn(iconName, o = {}) {
  const b = instance("IconButton", { variant: o.variant || "tile", tone: o.tone || "default", state: o.state || "default", Icon: iconName });
  b.name = o.name || `${iconName} button`;
  return b;
}

/** Sets the text of a layer inside a nested instance (an override, like typing into it in Figma). */
export function nestedText(root, instanceName, value, textName = "Label") {
  const holder = root.name === instanceName ? root : root.findAll((n) => n.name === instanceName)[0];
  if (!holder) throw new Error(`No layer "${instanceName}" in ${root.name}`);
  const t = holder.findAll((n) => n.type === "TEXT" && n.name === textName)[0];
  if (!t) throw new Error(`No text "${textName}" in ${instanceName}`);
  t.characters = String(value);
  return t;
}

/** Takes a child out of the auto layout flow (a true overlay) and places it. Call after add(). */
export function absolute(node, x, y) {
  node.layoutPositioning = "ABSOLUTE";
  node.x = x;
  node.y = y;
  return node;
}
