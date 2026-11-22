import { memo, type ReactNode } from "react";
import { cn } from "../lib/cn";

const TONES = { warn: "bg-warn-bg text-warn-fg", neutral: "bg-surface-2 text-muted" };

export const Badge = memo(function Badge({
  tone = "neutral",
  icon,
  children,
}: {
  tone?: keyof typeof TONES;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs", TONES[tone])}>
      {icon}
      {children}
    </span>
  );
});
