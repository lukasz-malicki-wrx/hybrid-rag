import { SearchIcon, SparklesIcon } from "@hybrid-rag/ui/icons";
import { FeatureCard } from "@/components/ui/feature-card";
import { Section } from "@/components/ui/section";
import { factParams } from "@/config/facts";
import { SectionHeading } from "@/components/ui/section-heading";
import type { SectionProps } from "./section-props";

const KINDS = ["meaning", "words"] as const;
const ICONS = { meaning: SparklesIcon, words: SearchIcon };

/** Hybrid search, part one: the two ways of searching and what each misses. */
export function Search({ t, locale }: SectionProps) {
  const facts = factParams(locale);
  return (
    <Section labelledBy="hiw-search">
      <SectionHeading id="hiw-search" align="center" eyebrow={t("howItWorks.search.eyebrow")} title={t("howItWorks.search.title")} lead={t("howItWorks.search.lead", facts)} className="mb-heading" />
      <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
        {KINDS.map((kind) => {
          const Icon = ICONS[kind];
          return (
            <FeatureCard
              key={kind}
              icon={<Icon width={28} height={28} />}
              title={t(`howItWorks.search.kinds.${kind}.title`)}
              text={t(`howItWorks.search.kinds.${kind}.text`)}
            />
          );
        })}
      </ul>
    </Section>
  );
}
