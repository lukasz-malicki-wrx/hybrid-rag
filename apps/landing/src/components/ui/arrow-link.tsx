import type { ReactNode } from "react";
import { ArrowRightIcon } from "@hybrid-rag/ui/icons";
import { cn } from "@hybrid-rag/ui/cn";
import { TextLink } from "./text-link";

/** "Learn more →": a text link with an arrow, in the colour of whatever it sits on (a card, a band). */
export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <TextLink href={href} variant="arrow" className={cn("group/arrow", className)}>
      {children}
      <ArrowRightIcon className="shrink-0 motion-safe:transition-transform motion-safe:group-hover/arrow:translate-x-0.5" />
    </TextLink>
  );
}
