import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BRIGHT_PALETTE, DEFAULT_PALETTE, type ThemedColor } from "./colors";

const read = (file: string) => readFileSync(path.join(import.meta.dirname, "palettes", file), "utf8");

/** `--bg: light-dark(#f6faf4, #1a1e1d);` as { light, dark }. */
function cssColor(css: string, name: string) {
  const match = new RegExp(`--${name}:\\s*light-dark\\(\\s*(#[0-9a-f]{6})\\s*,\\s*(#[0-9a-f]{6})\\s*\\)`, "i").exec(css);
  return match ? { light: match[1], dark: match[2] } : undefined;
}

const CASES: [string, string, Record<"bg" | "accent" | "accentFg", ThemedColor>][] = [
  ["DEFAULT_PALETTE", "vintage.css", DEFAULT_PALETTE],
  ["BRIGHT_PALETTE", "bright.css", BRIGHT_PALETTE],
];

describe.each(CASES)("%s", (_name, file, values) => {
  it(`equals the variables of ${file}`, () => {
    const css = read(file);
    expect(values.bg).toEqual(cssColor(css, "bg"));
    expect(values.accent).toEqual(cssColor(css, "accent"));
    expect(values.accentFg).toEqual(cssColor(css, "accent-fg"));
  });
});
