import { Card } from "@hybrid-rag/ui/card";
import { Heading } from "@hybrid-rag/ui/heading";
import { AlertIcon } from "@hybrid-rag/ui/icons";
import { Text } from "@hybrid-rag/ui/text";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatBand } from "@/components/ui/stat-band";
import { factParams } from "@/config/facts";
import type { SectionProps } from "./section-props";

const RULES = ["distance", "words"] as const;

/** The relevance gate: why the app can say that the documents do not contain an answer, and the distances that set its threshold. */
export function Gate({ t, locale }: SectionProps) {
  const facts = factParams(locale);
  return (
    <Section labelledBy="hiw-gate">
      <SectionHeading id="hiw-gate" eyebrow={t("howItWorks.gate.eyebrow")} title={t("howItWorks.gate.title")} lead={t("howItWorks.gate.lead")} className="mb-heading" />
      <Text className="font-medium">{t("howItWorks.gate.passes")}</Text>
      <ul className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
        {RULES.map((rule) => (
          <Card as="li" key={rule} className="p-6">
            <Text>{t(`howItWorks.gate.rules.${rule}`, facts)}</Text>
          </Card>
        ))}
      </ul>
      <div className="mt-8 flex max-w-copy gap-3">
        <AlertIcon width={22} height={22} className="mt-0.5 shrink-0 text-muted" />
        <Text>{t("howItWorks.gate.otherwise")}</Text>
      </div>
      <Heading level={3} size="h3" className="mb-6 mt-section">
        {t("howItWorks.gate.measured.title")}
      </Heading>
      <StatBand
        stats={[
          { value: facts.nearestAnswerable, label: t("howItWorks.gate.stats.answerable") },
          { value: facts.nearestOffTopic, label: t("howItWorks.gate.stats.offTopic", facts) },
          { value: facts.gateDistance, label: t("howItWorks.gate.stats.threshold") },
        ]}
      />
      <Text className="mt-8 max-w-copy">{t("howItWorks.gate.measured.text", facts)}</Text>
      <Text size="sm" tone="muted" className="mt-3 max-w-copy">
        {t("howItWorks.gate.measured.limit")}
      </Text>
    </Section>
  );
}
