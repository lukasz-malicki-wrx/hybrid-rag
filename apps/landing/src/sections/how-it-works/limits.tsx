import { Card } from "@hybrid-rag/ui/card";
import { Columns } from "@/components/ui/columns";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { factParams } from "@/config/facts";
import type { SectionProps } from "./section-props";

const ITEMS = ["ocr", "size", "accounts", "wrong", "language"] as const;

/** The limits that matter for this page's topic, said plainly and not hidden. */
export function Limits({ t, locale }: SectionProps) {
  const facts = factParams(locale);
  return (
    <Section labelledBy="hiw-limits" tone="panel">
      <Columns widths="narrow" aside={<SectionHeading id="hiw-limits" eyebrow={t("howItWorks.limits.eyebrow")} title={t("howItWorks.limits.title")} />}>
        <Card className="p-6">
          <ul className="max-w-copy list-disc space-y-3 pl-5">
            {ITEMS.map((item) => (
              <li key={item}>{t(`howItWorks.limits.items.${item}`, facts)}</li>
            ))}
          </ul>
        </Card>
      </Columns>
    </Section>
  );
}
