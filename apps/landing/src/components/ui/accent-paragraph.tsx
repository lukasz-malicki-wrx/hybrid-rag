import type { ReactNode } from "react";
import { cn } from "@hybrid-rag/ui/cn";
import { Text } from "@hybrid-rag/ui/text";

/** The paragraph under a title, with a vertical line in the decoration colour on its left. */
export function AccentParagraph({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Text size="lead" tone="muted" className={cn("max-w-copy border-l-2 border-ai pl-4", className)}>
      {children}
    </Text>
  );
}
