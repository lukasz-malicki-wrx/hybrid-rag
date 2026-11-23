import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO = path.resolve(import.meta.dirname, "../../../..");
const SKIP = new Set(["node_modules", ".next", ".turbo", "test-results", "playwright-report", ".lighthouseci"]);
const ICONS_DIR = import.meta.dirname;

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return [];
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sources(full);
    // The icon set's own files declare the icons; they do not count as a use.
    if (full.startsWith(ICONS_DIR) && /(index|glyphs)\.ts$/.test(name)) return [];
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

describe("icon set", () => {
  // A page that needs another icon adds it to glyphs.ts and index.ts in the same change.
  it("exports no icon that nothing in apps/ or packages/ uses", () => {
    const names = [...readFileSync(path.join(ICONS_DIR, "index.ts"), "utf8").matchAll(/export const (\w+Icon)\b/g)].map((m) => m[1] ?? "");
    const code = ["apps", "packages"].flatMap((dir) => sources(path.join(REPO, dir))).map((f) => readFileSync(f, "utf8")).join("\n");
    const unused = names.filter((name) => !new RegExp(`\\b${name}\\b`).test(code));
    expect(unused).toEqual([]);
  });
});
