import { readFileSync } from "node:fs";
import path from "node:path";
import { SITE_PALETTE } from "@/config/palette";
import { describe, expect, it } from "vitest";

describe("src/app/icon.svg", () => {
  // The SVG cannot import the palette, so its colours are checked here instead.
  it("uses only colours of the site palette", () => {
    const svg = readFileSync(path.resolve(import.meta.dirname, "../app/icon.svg"), "utf8");
    const allowed = new Set<string>(Object.values(SITE_PALETTE).flatMap((c) => [c.light, c.dark]));
    const used = [...svg.matchAll(/#[0-9a-f]{6}/gi)].map((m) => m[0].toLowerCase());
    expect(used.length).toBeGreaterThan(0);
    for (const colour of used) expect(allowed.has(colour), colour).toBe(true);
  });
});
