import { cn } from "./cn";

export type TileTone = "surface" | "danger" | "accent";

/** A 32px rounded square, the size of the buttons in bars and the rail (Figma: 32x32, r8). */
const TILE = "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors";

const TONES: Record<TileTone, string> = {
  surface: "bg-surface text-muted hover:bg-surface-2 hover:text-fg aria-pressed:text-accent",
  danger: "bg-surface text-muted hover:bg-surface-2 hover:text-danger",
  accent: "bg-accent text-accent-fg hover:opacity-90",
};

/**
 * Classes of a 32px tile. One place, so that IconButton and the tiles that have to be links (the
 * rail logo, "new chat") look the same. `cn` does not resolve conflicting utilities, so a tile
 * is never restyled with `className`: it is given the tone it needs here.
 */
export function tileClass(tone: TileTone = "surface", className?: string): string {
  return cn(TILE, TONES[tone], className);
}
