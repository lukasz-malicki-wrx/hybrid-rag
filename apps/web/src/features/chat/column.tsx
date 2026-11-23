import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@hybrid-rag/ui/cn";

/** The bubbles (and the box under them) start this far from the avatar's edge. */
export const MESSAGE_INSET = "ml-4";

/**
 * The column of a conversation: 736px of content (Figma) centred in the panel, with a gutter on
 * each side that is 16px on phones and 24px from `sm`. Messages and the message box are both
 * this, so their edges line up: the avatars start at its left edge and the answer bubbles end at
 * its right edge. `49rem` is the 736px plus the two 24px gutters (the box is border-box).
 */
export function Column({
  as: Component = "div",
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { as?: "div" | "ol" }) {
  return <Component className={cn("mx-auto w-full max-w-[49rem] px-4 sm:px-6", className)} {...props} />;
}

/**
 * The message box in its column: it spans from the bubbles' left edge (avatar edge + 16px) to
 * the column's right edge, as in the design.
 */
export function ComposerColumn({ children }: { children: ReactNode }) {
  return (
    <Column>
      <div className={MESSAGE_INSET}>{children}</div>
    </Column>
  );
}
