import type { ReactNode } from "react";
import { cn } from "@hybrid-rag/ui/cn";

const SIZES = { md: "size-14", lg: "size-20" };

/** The square tile an icon sits on at the top of a card: decoration, the title next to it names the card. */
export function IconTile({ size = "md", className, children }: { size?: keyof typeof SIZES; className?: string; children: ReactNode }) {
  return (
    <span aria-hidden="true" className={cn("flex shrink-0 items-center justify-center rounded-lg bg-surface-2 text-accent", SIZES[size], className)}>
      {children}
    </span>
  );
}
