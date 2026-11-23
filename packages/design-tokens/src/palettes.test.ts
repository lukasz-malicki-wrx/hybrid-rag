import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC = import.meta.dirname;
const PALETTES_DIR = path.join(SRC, "palettes");

type Mode = "light" | "dark";
type Palette = { name: string; values: Map<string, Record<Mode, string>> };

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Reads `--name: light-dark(#light, #dark);` declarations; anything else fails the test. */
function parsePalette(file: string): Palette {
  const css = stripComments(readFileSync(path.join(PALETTES_DIR, file), "utf8"));
  const values = new Map<string, Record<Mode, string>>();
  for (const [, name, value] of css.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    const colors = /^light-dark\(\s*(#[0-9a-f]{6})\s*,\s*(#[0-9a-f]{6})\s*\)$/i.exec(value.trim());
    if (!colors) throw new Error(`${file}: --${name} is not light-dark(#rrggbb, #rrggbb): ${value}`);
    values.set(name, { light: colors[1], dark: colors[2] });
  }
  return { name: file.replace(/\.css$/, ""), values };
}

const palettes = readdirSync(PALETTES_DIR)
  .filter((file) => file.endsWith(".css"))
  .map(parsePalette);

/** WCAG 2.1 relative luminance of an sRGB colour. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.1 contrast ratio, from 1 to 21. */
function contrast(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("palettes", () => {
  it("finds the shipped palettes", () => {
    expect(palettes.map((p) => p.name).sort()).toEqual(["bright", "classic", "vintage"]);
  });

  it.each(palettes)("$name defines the same variables as every other palette", ({ name, values }) => {
    const expected = [...palettes[0].values.keys()].sort();
    expect({ name, variables: [...values.keys()].sort() }).toEqual({ name, variables: expected });
  });
});

const theme = stripComments(readFileSync(path.join(SRC, "theme.css"), "utf8"));

describe("theme.css", () => {
  // The AI highlight tokens are used by consumers (the app's `ai-active` utility), not by theme.css.
  const consumed = new Set([...theme.matchAll(/var\(--([\w-]+)\)/g)].map((m) => m[1]));
  for (const name of ["ai-1", "ai-2", "ai-3"]) consumed.add(name);

  it("uses variables", () => {
    expect(consumed.size).toBeGreaterThan(10);
  });

  it.each(palettes)("$name defines every variable that theme.css and the AI highlight use", ({ values }) => {
    const missing = [...consumed].filter((name) => !values.has(name));
    expect(missing).toEqual([]);
  });

  it("defines the role colours of the chat frame from palette variables only", () => {
    for (const role of ROLES) {
      const sources = roleSources(role);
      for (const mode of ["light", "dark"] as const) {
        for (const { values } of palettes) expect(values.has(sources[mode]), `${role} ${mode}`).toBe(true);
      }
    }
  });

  it("maps every colour variable of the palettes to a utility colour", () => {
    const mapped = new Set([...theme.matchAll(/--color-[\w-]+:\s*var\(--([\w-]+)\)/g)].map((m) => m[1]));
    const unmapped = [...palettes[0].values.keys()].filter((name) => !mapped.has(name) && !name.startsWith("ai-"));
    expect(unmapped).toEqual([]);
  });
});

/*
 * Foreground/background pairs that the components and the app really use, found by the classes
 * they use together. Text needs 4.5:1; icons and focus indicators need 3:1.
 * - fg, muted, accent and danger sit on every surface: cards (surface), chips, badges and
 *   hover states (surface-2).
 * - ok is only used for status text on the page and in the sidebar (bg, surface).
 * - the AI sparkles icon (ai-2) sits on surface and on the active/hovered row (surface-2).
 */
const TEXT = 4.5;
const GRAPHIC = 3;
const SURFACES = ["bg", "surface", "surface-2"];
/*
 * Role tokens of theme.css (--color-bubble-user and friends) are light-dark() compositions of
 * palette variables. They are resolved here from the same declarations, so a pair is tested
 * with the colours the browser would really pick, and no hex value is repeated.
 */
const ROLES = ["bubble-user", "bubble-ai", "card-raised", "chip", "band", "band-fg", "band-muted"] as const;
const BUBBLES = ["bubble-user", "bubble-ai"];
const PAIRS: { fg: string; on: string[]; min: number }[] = [
  { fg: "fg", on: SURFACES, min: TEXT },
  { fg: "muted", on: SURFACES, min: TEXT },
  { fg: "accent", on: SURFACES, min: TEXT },
  { fg: "danger", on: SURFACES, min: TEXT },
  { fg: "ok", on: ["bg", "surface"], min: TEXT },
  { fg: "accent-fg", on: ["accent"], min: TEXT },
  { fg: "danger-fg", on: ["danger"], min: TEXT },
  { fg: "warn-fg", on: ["warn-bg"], min: TEXT },
  { fg: "mark-fg", on: ["mark"], min: TEXT },
  // Message bubbles carry running text and links in the accent colour.
  { fg: "fg", on: BUBBLES, min: TEXT },
  { fg: "muted", on: BUBBLES, min: TEXT },
  { fg: "accent", on: BUBBLES, min: TEXT },
  { fg: "danger", on: BUBBLES, min: TEXT },
  // Cards on the landing page's panel sections hold text, links and icons in these colours.
  { fg: "fg", on: ["card-raised"], min: TEXT },
  { fg: "muted", on: ["card-raised"], min: TEXT },
  { fg: "accent", on: ["card-raised"], min: TEXT },
  { fg: "focus", on: ["card-raised"], min: GRAPHIC },
  // The action chips under an answer hold only fg text: muted does not reach 4.5:1 on them.
  { fg: "fg", on: ["chip"], min: TEXT },
  // The dark band of the landing page: its text and its quieter text (links, captions). Decorative
  // strokes drawn on a band carry no information and are not tested.
  { fg: "band-fg", on: ["band"], min: TEXT },
  { fg: "band-muted", on: ["band"], min: TEXT },
  // The band button on the accent band (the call to action) holds band-fg text on `band`, tested
  // above; accent-fg is the text and the focus ring on the accent band itself.
  { fg: "accent-fg", on: ["accent"], min: TEXT },
  { fg: "focus", on: SURFACES, min: GRAPHIC },
  { fg: "focus", on: [...BUBBLES, "chip"], min: GRAPHIC },
  { fg: "ai-2", on: ["surface", "surface-2"], min: GRAPHIC },
];

/** Reads `--color-<role>: light-dark(var(--a), var(--b));` (or a plain var(--a)) from theme.css. */
function roleSources(role: string): Record<Mode, string> {
  const m = new RegExp(`--color-${role}:\\s*([^;]+);`).exec(theme);
  if (!m) throw new Error(`theme.css does not define --color-${role}`);
  const vars = [...m[1].matchAll(/var\(--([\w-]+)\)/g)].map((v) => v[1]);
  if (m[1].trim().startsWith("light-dark(")) {
    if (vars.length !== 2) throw new Error(`--color-${role}: expected light-dark(var(--a), var(--b))`);
    return { light: vars[0], dark: vars[1] };
  }
  if (vars.length !== 1) throw new Error(`--color-${role}: expected a single var()`);
  return { light: vars[0], dark: vars[0] };
}

describe.each(palettes)("$name contrast (WCAG 2.1 AA)", ({ values }) => {
  const color = (name: string, mode: Mode) => {
    if ((ROLES as readonly string[]).includes(name)) name = roleSources(name)[mode];
    const value = values.get(name);
    if (!value) throw new Error(`--${name} is not defined`);
    return value[mode];
  };

  for (const mode of ["light", "dark"] as const) {
    for (const { fg, on, min } of PAIRS) {
      for (const bg of on) {
        it(`${mode}: ${fg} on ${bg} is at least ${min}:1`, () => {
          expect(contrast(color(fg, mode), color(bg, mode))).toBeGreaterThanOrEqual(min);
        });
      }
    }
  }
});

describe("contrast helper", () => {
  it("matches the WCAG reference values", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrast("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    // #767676 on white is the well-known smallest grey that passes 4.5:1.
    expect(contrast("#767676", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#777777", "#ffffff")).toBeLessThan(4.5);
  });
});
