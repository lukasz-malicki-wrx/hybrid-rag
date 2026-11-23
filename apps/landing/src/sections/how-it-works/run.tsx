import { Heading } from "@hybrid-rag/ui/heading";
import { CloudIcon, ComputerIcon } from "@hybrid-rag/ui/icons";
import { Text } from "@hybrid-rag/ui/text";
import { FeatureCard } from "@/components/ui/feature-card";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { messageParams } from "@/lib/message-params";
import { codeTag } from "@/components/ui/inline-code";
import type { SectionProps } from "./section-props";

const WHERE = ["local", "api"] as const;
const ICONS = { local: ComputerIcon, api: CloudIcon };
const HARDWARE = ["index", "answer", "first", "shared"] as const;

/** Where the models run: on your computer or the Claude API for writing, and what the CPU costs. */
export function Run({ t, locale }: SectionProps) {
  const params = messageParams(t, locale);
  return (
    <Section labelledBy="hiw-run" tone="panel">
      <SectionHeading id="hiw-run" align="center" eyebrow={t("howItWorks.run.eyebrow")} title={t("howItWorks.run.title")} lead={t("howItWorks.run.lead")} className="mb-heading" />
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {WHERE.map((where) => {
          const Icon = ICONS[where];
          return (
            <FeatureCard
              key={where}
              icon={<Icon width={28} height={28} />}
              title={t(`howItWorks.run.${where}.title`)}
              text={t.rich(`howItWorks.run.${where}.text`, codeTag, params)}
            />
          );
        })}
      </ul>
      <div className="mt-section grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-30">
        <div>
          <Heading level={3} size="h3">
            {t("howItWorks.run.hardware.title")}
          </Heading>
          <Text className="mt-4">{t("howItWorks.run.hardware.lead")}</Text>
          <ul className="mt-5 list-disc space-y-2 pl-6">
            {HARDWARE.map((item) => (
              <li key={item}>{t(`howItWorks.run.hardware.items.${item}`, params)}</li>
            ))}
          </ul>
        </div>
        <Text className="lg:pt-12">{t.rich("howItWorks.run.hardware.gpu", codeTag)}</Text>
      </div>
    </Section>
  );
}
