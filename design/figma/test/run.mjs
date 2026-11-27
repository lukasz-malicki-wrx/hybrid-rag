#!/usr/bin/env node
/**
 * Runs dist/code.js against the mock Figma API twice (a plan with variable modes, and Starter with
 * one mode per collection) and checks the result: no errors, every text has a text style, every
 * solid colour is bound to a variable, every gap/padding is bound, no component is defined twice.
 *
 *   node design/figma/test/run.mjs            (after node design/figma/build.mjs)
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { createFigma } from "./mock-figma.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const code = await readFile(path.join(here, "../dist/code.js"), "utf8");

function pathOf(n) {
  const parts = [];
  for (let p = n; p && p.type !== "DOCUMENT"; p = p.parent) parts.unshift(p.name);
  return parts.join(" > ");
}

async function once(starter) {
  const log = [];
  const figma = createFigma(log);
  figma._starter = starter;
  const ctx = vm.createContext({ figma, console, setTimeout, Uint8Array, Promise });
  vm.runInContext(code, ctx, { filename: "code.js" });
  const msg = await Promise.race([figma._done, new Promise((r) => setTimeout(() => r("TIMEOUT"), 120000))]);
  const problems = [];
  if (!String(msg).startsWith("hybrid-rag design built")) problems.push(`closePlugin: ${msg}`);

  const stats = { nodes: 0, text: 0, instances: 0, components: 0, sets: 0, rawFills: 0, unboundGaps: 0 };
  const seen = new Set();
  const visit = (n) => {
    stats.nodes++;
    if (n.type === "TEXT") {
      stats.text++;
      if (!n.textStyleId) problems.push(`text without style: ${pathOf(n)}`);
    }
    if (n.type === "INSTANCE") stats.instances++;
    if (n.type === "COMPONENT_SET") stats.sets++;
    if (n.type === "COMPONENT" && (!n.parent || n.parent.type !== "COMPONENT_SET")) {
      stats.components++;
      if (seen.has(n.name)) problems.push(`component twice: ${n.name}`);
      seen.add(n.name);
    }
    if (n.type === "COMPONENT_SET") {
      if (seen.has(n.name)) problems.push(`component twice: ${n.name}`);
      seen.add(n.name);
    }
    for (const key of ["fills", "strokes"]) {
      if (n.type === "COMPONENT_SET" && key === "strokes") continue;
      for (const p of Array.isArray(n[key]) ? n[key] : []) {
        if (p.type === "SOLID" && !(p.boundVariables && p.boundVariables.color)) {
          stats.rawFills++;
          if (stats.rawFills <= 15) problems.push(`raw ${key.slice(0, -1)} (not a variable): ${pathOf(n)}`);
        }
      }
    }
    if (n.layoutMode && n.layoutMode !== "NONE" && n.type !== "COMPONENT_SET" && n.type !== "INSTANCE" && !n.name.startsWith("Icon/")) {
      for (const f of ["itemSpacing", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]) {
        if (n[f] && !n.boundVariables[f]) {
          stats.unboundGaps++;
          if (stats.unboundGaps <= 15) problems.push(`raw ${f}=${n[f]} (not a variable): ${pathOf(n)}`);
        }
      }
    }
    for (const c of n.children || []) visit(c);
  };
  for (const page of figma.root.children) visit(page);
  if (stats.rawFills > 15) problems.push(`... ${stats.rawFills} raw colours in total`);
  if (stats.unboundGaps > 15) problems.push(`... ${stats.unboundGaps} raw gaps in total`);
  const pages = figma.root.children.map((p) => `${p.name} (${p.children.length})`).join(", ");
  return { problems, stats, pages, msg };
}

let failed = false;
for (const starter of [false, true]) {
  const label = starter ? "Starter (one mode)" : "Modes";
  try {
    const { problems, stats, pages, msg } = await once(starter);
    console.log(`\n== ${label}: ${msg}\n   pages: ${pages}\n   ${JSON.stringify(stats)}`);
    if (problems.length) {
      failed = true;
      for (const p of problems) console.log(`   ✗ ${p}`);
    } else console.log("   ✓ no problems");
  } catch (e) {
    failed = true;
    console.log(`\n== ${label}: crashed: ${e.stack}`);
  }
}
process.exit(failed ? 1 : 0);
