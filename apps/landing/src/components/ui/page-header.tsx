import type { ReactNode } from "react";
import { cn } from "@hybrid-rag/ui/cn";
import { Heading } from "@hybrid-rag/ui/heading";
import { AccentParagraph } from "./accent-paragraph";
import { Container } from "./container";
import { Eyebrow } from "./eyebrow";
import { SplitSection } from "./split-section";

type PageHeaderProps = {
  /** The page's one h1. */
  title: ReactNode;
  /** The paragraph under it, with the accent line. */
  lead?: ReactNode;
  /** A small label over the title. */
  eyebrow?: ReactNode;
  /** Buttons or facts under the lead. */
  actions?: ReactNode;
  /** A picture beside the text (on the right; above it on a phone), with strokes over its corner. */
  media?: ReactNode;
  /** "panel" is the tinted band of the top of a page; the first section after it is then "plain". */
  tone?: "panel" | "plain";
};

/** The top of a page: eyebrow, its h1, the accent paragraph, optional buttons, and optionally a picture beside them. */
export function PageHeader({ title, lead, eyebrow, actions, media, tone = "panel" }: PageHeaderProps) {
  const text = (
    <div className="max-w-2xl">
      {eyebrow ? <Eyebrow className="mb-7">{eyebrow}</Eyebrow> : null}
      <Heading level={1} size="h1">
        {title}
      </Heading>
      {lead ? <AccentParagraph className="mt-8 sm:mt-10">{lead}</AccentParagraph> : null}
      {actions ? <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 sm:mt-15">{actions}</div> : null}
    </div>
  );
  return (
    <header
      className={cn(
        "pb-section",
        // The space above is a section's on every page. A picture runs right under the site header on a phone.
        media ? "pt-0 lg:pt-section" : "pt-section",
        tone === "panel" && "surface-panel",
      )}
    >
      <Container>
        {media ? (
          <SplitSection media={media} doodle bleed>
            {text}
          </SplitSection>
        ) : (
          text
        )}
      </Container>
    </header>
  );
}
