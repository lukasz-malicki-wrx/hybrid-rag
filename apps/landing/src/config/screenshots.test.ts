import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SCREENSHOT_IDS, SCREENSHOTS } from "./screenshots";

describe("screenshots manifest", () => {
  it("defines every id, with a size", () => {
    expect(Object.keys(SCREENSHOTS).sort()).toEqual([...SCREENSHOT_IDS].sort());
    for (const id of SCREENSHOT_IDS) {
      const entry = SCREENSHOTS[id];
      expect(entry.width, id).toBeGreaterThan(0);
      expect(entry.height, id).toBeGreaterThan(0);
    }
  });

  it("points at files that exist, in both themes", () => {
    for (const id of SCREENSHOT_IDS) {
      const src = SCREENSHOTS[id].src;
      if (!src) continue;
      for (const file of [src.light, src.dark]) {
        expect(existsSync(path.resolve(import.meta.dirname, "../../public", file.replace(/^\//, ""))), file).toBe(true);
      }
    }
  });
});
