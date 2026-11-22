import { memo, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const TONES = { default: "text-fg", muted: "text-muted", danger: "text-danger", ok: "text-ok" };
const SIZES = { base: "text-base", sm: "text-sm", xs: "text-xs" };

export type TextProps = HTMLAttributes<HTMLElement> & {
  as?: "p" | "span";
  tone?: keyof typeof TONES;
  size?: keyof typeof SIZES;
};

export const Text = memo(function Text({ as: Tag = "p", tone = "default", size = "base", className, ...props }: TextProps) {
  return <Tag className={cn(TONES[tone], SIZES[size], className)} {...props} />;
});
