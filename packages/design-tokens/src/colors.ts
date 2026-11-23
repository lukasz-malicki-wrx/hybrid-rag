/**
 * Palette colours as values, for the few places that cannot use a CSS variable: the browser's
 * theme colour, the web manifest, generated icons. They are the same values as the palette files
 * in src/palettes (colors.test.ts keeps them equal). Everything that can use a CSS variable must
 * do that instead.
 */
export type ThemedColor = { readonly light: string; readonly dark: string };

/** The default palette (vintage, src/palettes/vintage.css): the app. */
export const DEFAULT_PALETTE = {
  bg: { light: "#f6faf4", dark: "#1a1e1d" },
  accent: { light: "#4d5a55", dark: "#d9ab9a" },
  accentFg: { light: "#ffffff", dark: "#1a1e1d" },
} as const satisfies Record<string, ThemedColor>;

/** The bright palette (src/palettes/bright.css): the landing page. */
export const BRIGHT_PALETTE = {
  bg: { light: "#ffffff", dark: "#171a19" },
  accent: { light: "#a54d3c", dark: "#e39a89" },
  accentFg: { light: "#ffffff", dark: "#171a19" },
} as const satisfies Record<string, ThemedColor>;
