import { Text } from "@hybrid-rag/ui/text";
import { ArrowLink } from "@/components/ui/arrow-link";
import { StatBand } from "@/components/ui/stat-band";
import { factParams } from "@/config/facts";
import { SITE } from "@/config/site";
import type { HomeSectionProps } from "./props";

/** The measured result in four numbers, and under it, in one sentence, how it was measured and what it does not show. */
export function Numbers({ t, locale }: HomeSectionProps) {
  const facts = factParams(locale);
  const stats = [
    { value: facts.evalQuestions, label: t("home.numbers.items.questions") },
    { value: facts.hybridTop10, label: t("home.numbers.items.top10") },
    { value: t("home.numbers.ratio", facts), label: t("home.numbers.items.offTopic") },
    { value: facts.evalPassages, label: t("home.numbers.items.passages") },
  ];
  return (
    <div className="mt-15 lg:mt-30">
      <StatBand stats={stats} />
      <Text tone="muted" className="mt-8 max-w-copy">
        {t("home.numbers.method", facts)}
      </Text>
      <ArrowLink href={SITE.docs.evaluation} className="mt-4">
        {t("home.numbers.link")}
      </ArrowLink>
    </div>
  );
}
