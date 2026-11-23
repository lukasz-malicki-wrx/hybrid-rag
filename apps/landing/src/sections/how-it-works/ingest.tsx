import { Text } from "@hybrid-rag/ui/text";
import { Screenshot } from "@/components/screenshot";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { SplitSection } from "@/components/ui/split-section";
import { factParams } from "@/config/facts";
import type { SectionProps } from "./section-props";
import { StepList } from "./step-list";

const STEPS = ["save", "read", "cut", "embed", "store"] as const;

/** Flow 1 in detail: what happens to a PDF after it is uploaded. */
export function Ingest({ t, locale }: SectionProps) {
  const facts = factParams(locale);
  const steps = STEPS.map((id) => ({ id, title: t(`howItWorks.ingest.steps.${id}.title`), body: t(`howItWorks.ingest.steps.${id}.text`, facts) }));
  return (
    <Section labelledBy="hiw-ingest" tone="panel">
      <SplitSection
        align="top"
        side="left"
        media={
          <>
            <Screenshot id="document" locale={locale} sizes="(min-width: 1152px) 540px, 100vw" />
            <Text size="sm" tone="muted" className="border-t border-border p-4">
              {t("howItWorks.ingest.caption")}
            </Text>
          </>
        }
      >
        <SectionHeading id="hiw-ingest" eyebrow={t("howItWorks.ingest.eyebrow")} title={t("howItWorks.ingest.title")} lead={t("howItWorks.ingest.lead")} className="mb-10" />
        <StepList steps={steps} />
      </SplitSection>
    </Section>
  );
}
