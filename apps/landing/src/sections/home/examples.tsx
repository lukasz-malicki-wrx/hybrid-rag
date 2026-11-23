import { FileIcon, NotFoundIcon, SparklesIcon, UnknownIcon } from "@hybrid-rag/ui/icons";
import { Text } from "@hybrid-rag/ui/text";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { AnswerExample } from "./answer-example";
import type { HomeSectionProps } from "./props";

/** Two answers written by hand, in the layout of testimonials: one cited, one honest refusal. They say they are examples. */
export function Examples({ t }: Pick<HomeSectionProps, "t">) {
  const reference = (children: React.ReactNode) => (
    <Text as="span" size="sm" className="ml-0.5 align-super font-semibold text-accent">
      {children}
    </Text>
  );
  const badge = { tone: "neutral", text: t("home.examples.badge") } as const;
  return (
    <Section labelledBy="home-examples">
      <SectionHeading id="home-examples" eyebrow={t("home.examples.eyebrow")} title={t("home.examples.title")} className="mb-heading" />
      <ul className="grid grid-cols-1 gap-x-6 lg:grid-cols-2 lg:grid-rows-[auto_1fr_auto]">
        <AnswerExample
          icon={<SparklesIcon width={32} height={32} />}
          questionLabel={t("home.examples.questionLabel")}
          question={t("home.examples.cited.question")}
          source={{ icon: <FileIcon width={16} height={16} aria-hidden="true" />, text: t("home.examples.cited.source") }}
          badge={badge}
        >
          {t.rich("home.examples.cited.answer", { ref: reference })}
        </AnswerExample>
        <AnswerExample
          icon={<UnknownIcon width={32} height={32} />}
          questionLabel={t("home.examples.questionLabel")}
          question={t("home.examples.refused.question")}
          source={{ icon: <NotFoundIcon width={16} height={16} aria-hidden="true" />, text: t("home.examples.refused.source") }}
          badge={badge}
        >
          {t("home.examples.refused.answer")}
        </AnswerExample>
      </ul>
      <Text size="sm" tone="muted" className="mt-6 max-w-copy">
        {t("home.examples.note")}
      </Text>
    </Section>
  );
}
