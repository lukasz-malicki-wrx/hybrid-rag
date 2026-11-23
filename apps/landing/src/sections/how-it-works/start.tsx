import { Heading } from "@hybrid-rag/ui/heading";
import { Text } from "@hybrid-rag/ui/text";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { factParams } from "@/config/facts";
import { CodeBlock } from "./code-block";
import { SEED_COMMAND, START_COMMAND } from "./commands";
import { codeTag } from "@/components/ui/inline-code";
import type { SectionProps } from "./section-props";

/** The quick start of the README: the real commands, in blocks that can be selected. */
export function Start({ t, locale }: SectionProps) {
  const facts = factParams(locale);
  return (
    <Section labelledBy="hiw-start">
      <SectionHeading id="hiw-start" eyebrow={t("howItWorks.start.eyebrow")} title={t("howItWorks.start.title")} lead={t("howItWorks.start.lead", facts)} className="mb-heading" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-30">
        <div>
          <Heading level={3} size="title">
            {t("howItWorks.start.start.title")}
          </Heading>
          <div className="mt-3">
            <CodeBlock label={t("howItWorks.start.start.label")} command={START_COMMAND} />
          </div>
          <Text className="mt-3">{t.rich("howItWorks.start.start.text", codeTag)}</Text>
        </div>
        <div>
          <Heading level={3} size="title">
            {t("howItWorks.start.seed.title")}
          </Heading>
          <div className="mt-3">
            <CodeBlock label={t("howItWorks.start.seed.label")} command={SEED_COMMAND} />
          </div>
          <Text className="mt-3">{t("howItWorks.start.seed.text", facts)}</Text>
        </div>
        <Text className="lg:col-span-2">{t.rich("howItWorks.start.open", codeTag)}</Text>
      </div>
    </Section>
  );
}
