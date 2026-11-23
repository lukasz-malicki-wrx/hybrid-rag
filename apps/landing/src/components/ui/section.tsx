import type { ReactNode } from "react";
import { cn } from "@hybrid-rag/ui/cn";
import { Container } from "./container";

export type SectionProps = {
  /** The id of the section's heading: it becomes the section's accessible name. */
  labelledBy: string;
  /**
   * "plain" sits on the page colour; "panel" is the slightly different colour that tells
   * neighbours apart. Sections alternate between the two; there are no borders between them.
   */
  tone?: "plain" | "panel";
  /** Padding of the section, the same everywhere unless a page needs less. */
  spacing?: "normal" | "tight";
  id?: string;
  className?: string;
  children: ReactNode;
};

/** A band of a page: vertical rhythm, the page width, and a named region for assistive technology. */
export function Section({ labelledBy, tone = "plain", spacing = "normal", id, className, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(spacing === "normal" ? "py-section" : "py-section-tight", tone === "panel" && "surface-panel", className)}
    >
      <Container>{children}</Container>
    </section>
  );
}
