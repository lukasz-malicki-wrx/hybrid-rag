import { CheckIcon, ComputerIcon, SearchIcon } from "@hybrid-rag/ui/icons";
import { Heading } from "@hybrid-rag/ui/heading";
import { Text } from "@hybrid-rag/ui/text";
import { FeatureCard } from "@/components/ui/feature-card";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatBand } from "@/components/ui/stat-band";
import { factParams } from "@/config/facts";
import type { Locale } from "@/lib/i18n";
import { messageParams } from "@/lib/message-params";
import { getTranslator } from "@/lib/translator";
import { answerTags } from "@/components/rich-tags";

const REASONS = ["check", "local", "measured"] as const;
const ICONS = { check: CheckIcon, local: ComputerIcon, measured: SearchIcon };
const NUMBERS = ["questions", "documents", "answerable", "offTopic"] as const;
const NUMBER_FACTS = { questions: "evalQuestions", documents: "evalDocuments", answerable: "evalAnswerable", offTopic: "evalOffTopic" } as const;

/** Why the project exists, as far as the repository shows it: three decisions it is built around, and the numbers of the evaluation. */
export function Why({ locale }: { locale: Locale }) {
  const { t } = getTranslator(locale);
  const tags = answerTags(locale);
  const params = messageParams(t, locale);
  const facts = factParams(locale);
  return (
    <Section labelledBy="why-heading">
      <SectionHeading id="why-heading" align="center" title={t("about.why.heading")} lead={t("about.why.lead")} className="mb-heading" />
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {REASONS.map((id) => {
          const Icon = ICONS[id];
          return (
            <FeatureCard
              key={id}
              icon={<Icon width={28} height={28} />}
              title={t(`about.why.items.${id}.title`)}
              text={t.rich(`about.why.items.${id}.text`, tags, params)}
            />
          );
        })}
      </ul>
      <div className="mt-section">
        <Heading level={3} size="h3" className="text-center">
          {t("about.numbers.title")}
        </Heading>
        <Text tone="muted" className="mx-auto mb-8 mt-3 max-w-copy text-center">
          {t("about.numbers.lead")}
        </Text>
        <StatBand stats={NUMBERS.map((id) => ({ value: facts[NUMBER_FACTS[id]], label: t(`about.numbers.${id}`) }))} />
      </div>
    </Section>
  );
}
