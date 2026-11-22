import { memo, type HTMLAttributes, type Ref } from "react";
import { cn } from "../lib/cn";

const SIZES = { xl: "text-2xl font-semibold sm:text-3xl", lg: "text-2xl font-semibold", md: "text-lg font-semibold", sm: "font-semibold" };

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: 1 | 2 | 3;
  size?: keyof typeof SIZES;
  ref?: Ref<HTMLHeadingElement>;
};

export const Heading = memo(function Heading({ level = 2, size = "md", className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag className={cn(SIZES[size], className)} {...props} />;
});
