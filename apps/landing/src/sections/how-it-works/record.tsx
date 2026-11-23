import { Card } from "@hybrid-rag/ui/card";
import { CheckIcon } from "@hybrid-rag/ui/icons";
import { Text } from "@hybrid-rag/ui/text";
import { Columns } from "@/components/ui/columns";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import type { SectionProps } from "./section-props";

const ITEMS = ["question", "chunks", "documents", "embedding", "llm", "prompt", "context"] as const;

/** What is saved with each answer, and why nothing is ever changed afterwards. */
export function StoredRecord({ t }: SectionProps) {
  return (
    <Section labelledBy="hiw-record">
      <Columns widths="narrow" aside={<SectionHeading id="hiw-record" eyebrow={t("howItWorks.record.eyebrow")} title={t("howItWorks.record.title")} lead={t("howItWorks.record.lead")} />}>
        <Card className="p-6">
          <Text className="font-medium">{t("howItWorks.record.list")}</Text>
          <ul className="mt-4 flex flex-col gap-3">
            {ITEMS.map((item) => (
              <li key={item} className="flex gap-3">
                <CheckIcon width={20} height={20} className="mt-0.5 shrink-0 text-accent" />
                <Text as="span">{t(`howItWorks.record.items.${item}`)}</Text>
              </li>
            ))}
          </ul>
        </Card>
        <Text className="mt-8">{t("howItWorks.record.append")}</Text>
      </Columns>
    </Section>
  );
}
