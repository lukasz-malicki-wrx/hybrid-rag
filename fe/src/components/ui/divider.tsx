import { memo, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type DividerProps = HTMLAttributes<HTMLHRElement>;

/** Horizontal line between two parts of a view; spacing comes from the parent. */
export const Divider = memo(function Divider({ className, ...props }: DividerProps) {
  return <hr className={cn("border-border", className)} {...props} />;
});
