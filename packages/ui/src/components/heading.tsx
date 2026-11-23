import { memo, type HTMLAttributes, type Ref } from "react";
import { cn } from "../lib/cn";

const SIZES = {
  // The title of a pane bar (BarHeader): 20px bold.
  bar: "text-xl font-bold",
  // A heading inside a pane, one step down from the bar: 16px bold.
  title: "text-base font-bold",
  // A small caption over a block: 14px medium.
  caption: "text-sm font-medium",
  // The small capitals over a list: 12px semibold.
  overline: "text-xs font-semibold uppercase tracking-wide",
  xl: "text-2xl font-semibold sm:text-3xl",
  lg: "text-2xl font-semibold",
  md: "text-lg font-semibold",
  sm: "font-semibold",
  // Landing page scale (fluid sizes defined by the site's stylesheet: text-h1, text-h2, text-h3).
  h1: "text-balance text-h1 font-semibold",
  h2: "text-balance text-h2 font-semibold",
  h3: "text-balance text-h3 font-semibold",
};

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: 1 | 2 | 3 | 4;
  size?: keyof typeof SIZES;
  ref?: Ref<HTMLHeadingElement>;
};

export const Heading = memo(function Heading({ level = 2, size = "md", className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag className={cn(SIZES[size], className)} {...props} />;
});
