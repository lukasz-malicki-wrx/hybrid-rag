import type { ReactNode } from "react";
import { cn } from "@hybrid-rag/ui/cn";
import { Doodle } from "./doodle";

type SplitSectionProps = {
  /** The picture (a ShotFrame or a screenshot). */
  media: ReactNode;
  /** Which side the picture is on from the large breakpoint up. On a phone it is always first. */
  side?: "left" | "right";
  /** Strokes over the picture's outer top corner, the one away from the text (wide screens only: there is room beside it). */
  doodle?: boolean;
  /**
   * "center": the text and the picture are centred on each other (a heading with a short text).
   * "top": both start at the top, because the text may be much longer than the picture; on wide
   * screens the picture then stays in view while the text beside it is read.
   */
  align?: "center" | "top";
  /**
   * On a phone the picture runs to both edges of the screen, 375 by 240 in proportion, without
   * border or rounded corners, and is cropped to that (a picture under the site header).
   */
  bleed?: boolean;
  /** On a phone the text comes before the picture (a page's top), instead of the picture first. */
  textFirst?: boolean;
  /** The text: an eyebrow, a heading, paragraphs, buttons. */
  children: ReactNode;
  className?: string;
};

const BLEED =
  "max-lg:-mx-gutter max-lg:aspect-[375/240] max-lg:rounded-none max-lg:border-0 max-lg:[&_.screenshot]:h-full max-lg:[&_.screenshot_img]:h-full max-lg:[&_.screenshot_img]:object-cover max-lg:[&_.screenshot_img]:object-left-top";

/** A picture and a text side by side in two equal columns (540px each at the design width, 120px apart). */
export function SplitSection({ media, side = "right", doodle = false, align = "center", bleed = false, textFirst = false, children, className }: SplitSectionProps) {
  const left = side === "left";
  const top = align === "top";
  return (
    <div className={cn("grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-30", top ? "items-start" : "items-center", className)}>
      <div className={cn(textFirst ? "max-lg:order-last" : "max-lg:order-first", !left && "lg:order-last", top && "lg:self-stretch")}>
        <div className={cn("relative", top && "lg:sticky lg:top-6")}>
          {doodle ? <Doodle className={cn("absolute -top-12 hidden lg:block", left ? "-scale-x-100 lg:-right-(--doodle-outset)" : "lg:-left-(--doodle-outset)")} /> : null}
          <div className={cn("overflow-hidden rounded-xl border border-border bg-panel", bleed && BLEED)}>{media}</div>
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
