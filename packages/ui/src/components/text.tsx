import { memo, type HTMLAttributes } from "react";
import { cn } from "../lib/cn";

const TONES = {
  default: "text-fg",
  muted: "text-muted",
  danger: "text-danger",
  ok: "text-ok",
  // On the dark band (landing numbers, footer) and on the accent band (call to action): the text
  // colours that have the contrast there.
  band: "text-band-fg",
  "band-muted": "text-band-muted",
  "accent-fg": "text-accent-fg",
};
// The last three sizes are the landing page's type scale: fluid sizes defined by the site's
// stylesheet (text-lead, text-eyebrow, text-stat), so they only exist where that stylesheet is used.
const SIZES = {
  base: "text-base",
  sm: "text-sm",
  xs: "text-xs",
  // The larger paragraph under a title.
  lead: "text-pretty text-lead",
  // The small label over a title.
  eyebrow: "text-eyebrow",
  // A big number.
  stat: "text-stat font-semibold tabular-nums",
};

/** The elements a text may be: a paragraph by default; a term, a description or a caption inside their lists and figures. */
export type TextElement = "p" | "span" | "div" | "dt" | "dd" | "figcaption";

export type TextProps = HTMLAttributes<HTMLElement> & {
  as?: TextElement;
  tone?: keyof typeof TONES;
  size?: keyof typeof SIZES;
};

export const Text = memo(function Text({ as: Tag = "p", tone = "default", size = "base", className, ...props }: TextProps) {
  return <Tag className={cn(TONES[tone], SIZES[size], className)} {...props} />;
});
