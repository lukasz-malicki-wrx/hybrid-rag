import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type CardProps = HTMLAttributes<HTMLElement> & {
  /** The element: a card that is a list item or a section is not a div. */
  as?: "div" | "li" | "article" | "section";
};

/**
 * A bordered block. Its colour is `surface`, unless a container sets `--card-bg` to a colour that
 * stands out from its own (the landing page's panel sections do), so a card never melts into the
 * section it is in. Spacing inside is the caller's, via `className`.
 */
export function Card({ as: Tag = "div", className, ...props }: CardProps) {
  return <Tag className={cn("rounded-lg border border-border bg-(--card-bg,var(--surface))", className)} {...props} />;
}
