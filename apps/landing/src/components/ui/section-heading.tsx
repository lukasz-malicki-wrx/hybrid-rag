import type { ReactNode } from "react";
import { cn } from "@hybrid-rag/ui/cn";
import { Heading } from "@hybrid-rag/ui/heading";
import { Text } from "@hybrid-rag/ui/text";
import { Eyebrow } from "./eyebrow";

type SectionHeadingProps = {
  /** Referenced by the Section's `labelledBy`. */
  id: string;
  title: ReactNode;
  /** A short sentence under the title. */
  lead?: ReactNode;
  /** A small label over the title (a category, not a slogan). */
  eyebrow?: ReactNode;
  /** 2 for a section of a page, 3 inside a section that has its own h2. */
  level?: 2 | 3;
  /** "center" puts the eyebrow, the title and the lead in the middle of the page. */
  align?: "start" | "center";
  className?: string;
};

/** Title block of a section: optional eyebrow, the heading, an optional lead. */
export function SectionHeading({ id, title, lead, eyebrow, level = 2, align = "start", className }: SectionHeadingProps) {
  const center = align === "center";
  return (
    <header className={cn("max-w-copy", center && "mx-auto text-center", className)}>
      {eyebrow ? <Eyebrow align={align} className="mb-7">{eyebrow}</Eyebrow> : null}
      <Heading id={id} level={level} size={level === 2 ? "h2" : "h3"}>
        {title}
      </Heading>
      {lead ? (
        <Text size="lead" tone="muted" className="mt-4">
          {lead}
        </Text>
      ) : null}
    </header>
  );
}
