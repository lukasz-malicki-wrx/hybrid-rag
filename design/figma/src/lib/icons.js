/**
 * Icons: every icon of packages/ui/src/icons (Lucide, stroke 1.75, and the brand marks of Simple
 * Icons) as a 24x24 component "Icon/<Name>" whose colour is bound to the "fg" role. Instances are
 * scaled with icon(name, size, role): the app draws icons at 18 px by default (create-icon.tsx).
 */
import { DATA } from "../generated/data.js";
import { paint } from "./tokens.js";
import { component, get } from "./components.js";

const BRANDS = ["Claude", "Postgres", "Ollama", "FastApi", "NextJs"];

function recolor(node, role, brand) {
  const visit = (n) => {
    if ("strokes" in n && n.strokes.length) n.strokes = [paint(role)];
    if ("fills" in n && n.fills.length && n.type !== "FRAME" && n.type !== "COMPONENT" && n.type !== "INSTANCE") n.fills = [paint(role)];
    if ("children" in n) n.children.forEach(visit);
  };
  visit(node);
  if (brand) return;
}

export async function setupIcons() {
  for (const [name, svg] of Object.entries(DATA.icons)) {
    await component(
      `Icon/${name}`,
      (c) => {
        c.layoutMode = "NONE";
        c.resize(24, 24);
        c.fills = [];
        const node = figma.createNodeFromSvg(svg);
        node.fills = [];
        const kids = [...node.children];
        for (const k of kids) {
          c.appendChild(k);
          k.constraints = { horizontal: "SCALE", vertical: "SCALE" };
        }
        node.remove();
        recolor(c, "fg", BRANDS.includes(name));
      },
      { doc: false, description: BRANDS.includes(name) ? "Brand mark (Simple Icons, CC0)" : "Lucide icon (ISC), stroke 1.75" },
    );
  }
}

export function iconNames() {
  return Object.keys(DATA.icons);
}

/** An icon instance at `size` px in a colour role. The layer is named `layerName` (for swapProp/boolProp). */
export function icon(name, size = 18, role = "fg", layerName) {
  const inst = get(`Icon/${name}`).createInstance();
  inst.resize(size, size);
  inst.name = layerName || `Icon/${name}`;
  if (role !== "fg") recolor(inst, role);
  return inst;
}

/** Changes the colour of an icon instance (e.g. inside an instance of a button). */
export function tintIcon(inst, role) {
  recolor(inst, role);
  return inst;
}
