import type { ReactNode } from "react";
import { Columns } from "../ui/columns";
import { Prose } from "../ui/prose";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";

type LegalSectionProps = {
  /** The id of the heading: it names the section. */
  id: string;
  title: string;
  lead?: string;
  tone?: "plain" | "panel";
  children: ReactNode;
};

/** A part of a legal page (privacy, accessibility statement): the heading on the left, a reading column of long-form text on the right. */
export function LegalSection({ id, title, lead, tone = "plain", children }: LegalSectionProps) {
  return (
    <Section labelledBy={id} tone={tone}>
      <Columns widths="narrow" aside={<SectionHeading id={id} title={title} lead={lead} />}>
        <Prose className="[&>:first-child]:mt-0">{children}</Prose>
      </Columns>
    </Section>
  );
}
