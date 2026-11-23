import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { messageParams } from "@/lib/message-params";
import type { SectionProps } from "./section-props";
import { StepGrid } from "./step-grid";

const STEPS = ["prompt", "rules", "stream", "check"] as const;

/** Flow 2 after the search: how the language model is used and how its answer is checked. */
export function Answer({ t, locale }: SectionProps) {
  const params = messageParams(t, locale);
  const steps = STEPS.map((id) => ({ id, title: t(`howItWorks.answer.steps.${id}.title`), body: t(`howItWorks.answer.steps.${id}.text`, params) }));
  return (
    <Section labelledBy="hiw-answer" tone="panel">
      <SectionHeading id="hiw-answer" align="center" eyebrow={t("howItWorks.answer.eyebrow")} title={t("howItWorks.answer.title")} lead={t("howItWorks.answer.lead")} className="mb-heading" />
      <StepGrid steps={steps} />
    </Section>
  );
}
