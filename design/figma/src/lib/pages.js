/**
 * Pages and placement. Starter files have at most 3 pages, so the file has exactly three:
 * "Design System", "Landing" and "App". Running the plugin again empties them and draws again.
 */
import { add, frame, text } from "./layout.js";
import { lightName, makeDark } from "./dark.js";

export const PAGE_NAMES = ["Design System", "Landing", "App"];

export async function setupPages() {
  const pages = [...figma.root.children];
  const out = {};
  for (let i = 0; i < PAGE_NAMES.length; i++) {
    const name = PAGE_NAMES[i];
    let page = pages.find((p) => p.name === name);
    if (!page) {
      // Reuse an untitled page (a new file has "Page 1") before creating one.
      page = pages.find((p) => !PAGE_NAMES.includes(p.name) && !Object.values(out).includes(p));
      if (page) page.name = name;
      else {
        page = figma.createPage();
        page.name = name;
      }
    }
    await figma.setCurrentPageAsync(page);
    // Removing a component can take its instances with it, so some nodes may already be gone:
    // go round a few times and keep the last error for the report.
    let lastError = null;
    for (let pass = 0; pass < 5 && page.children.length; pass++) {
      for (const child of [...page.children]) {
        try {
          if (!child.removed) child.remove();
        } catch (e) {
          lastError = e;
        }
      }
    }
    if (page.children.length) {
      const left = page.children.slice(0, 3).map((c) => `${c.type} ${c.name}`).join(", ");
      throw new Error(`Could not empty the page "${name}" (${page.children.length} left: ${left}). ${lastError ? lastError.message : ""}`);
    }
    out[name] = page;
  }
  return { ds: out["Design System"], landing: out["Landing"], app: out["App"] };
}

/**
 * Stacks top-level frames on a page: each call to place() puts the node below the previous one
 * (gap 200), or to the right of it when { beside: true }.
 */
export function placer(page, gap = 200) {
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  let last = null;
  return function place(node, o = {}) {
    if (node.parent !== page) page.appendChild(node);
    if (o.beside && last) {
      node.x = last.x + last.width + (o.gap || gap);
      node.y = last.y;
      rowHeight = Math.max(rowHeight, node.height);
    } else {
      y = last ? last.y + rowHeight + gap : 0;
      node.x = x;
      node.y = y;
      rowHeight = node.height;
    }
    last = node;
    return node;
  };
}

/**
 * One row of screens: a label, then for each screen its light version and the dark copy beside it.
 * screens: [{ name: "Home / Desktop", build: async () => FrameNode }]. Returns the frames.
 */
export async function screenRow(page, place, title, screens) {
  const label = await text(title, "App/Heading XL", "fg", { name: `Label · ${title}` });
  place(label);
  const made = [];
  let first = true;
  for (const s of screens) {
    const started = Date.now();
    console.log(`[hybrid-rag] screen ${s.name}…`);
    const f = await s.build();
    console.log(`[hybrid-rag] screen ${s.name}: ${Date.now() - started} ms`);
    f.name = s.name;
    lightName(f);
    place(f, { beside: !first, gap: first ? undefined : 160 });
    if (first) {
      f.y = label.y + label.height + 40;
    }
    first = false;
    const dark = await s.build();
    dark.name = s.name;
    makeDark(dark);
    page.appendChild(dark);
    dark.x = f.x + f.width + 80;
    dark.y = f.y;
    place(dark, { beside: true, gap: 80 });
    dark.y = f.y;
    made.push(f, dark);
  }
  return made;
}

/** A board on the Design System page: a titled container whose content wraps in rows. */
export async function board(title, description, o = {}) {
  const b = frame(title, { dir: "col", gap: 40, pad: 80, fill: "surface", w: o.width || 2400 });
  const head = frame("Header", { dir: "col", gap: 12, w: "fill" });
  add(head, await text(title, "Landing/H1 Desktop", "fg"));
  if (description) add(head, await text(description, "Landing/Lead Desktop", "muted", { w: 960 }));
  add(b, head);
  const body = frame("Content", { dir: o.dir || "row", gap: o.gap || 40, wrap: o.dir !== "col", w: "fill", align: "start" });
  add(b, body);
  return { board: b, body };
}
