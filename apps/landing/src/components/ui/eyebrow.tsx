import type { ReactNode } from "react";
import { cn } from "@hybrid-rag/ui/cn";
import { Text } from "@hybrid-rag/ui/text";

type EyebrowProps = {
  children: ReactNode;
  /** "center" for a heading that is centred: the dash and the text stay together, in the middle. */
  align?: "start" | "center";
  className?: string;
};

/** The small label over a title: a 40x2 dash in the decoration colour, then the text (a category, not a slogan). */
export function Eyebrow({ children, align = "start", className }: EyebrowProps) {
  return (
    <Text size="eyebrow" tone="muted" className={cn("flex items-center gap-3", align === "center" && "justify-center", className)}>
      <span aria-hidden="true" className="h-0.5 w-10 shrink-0 bg-ai" />
      <span>{children}</span>
    </Text>
  );
}
