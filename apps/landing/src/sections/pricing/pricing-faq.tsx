import { Columns } from "@/components/ui/columns";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/lib/i18n";
import { getTranslator } from "@/lib/translator";
import { answerTags } from "@/components/rich-tags";
import { FaqList } from "@/sections/faq/faq-list";

const QUESTIONS = ["buy", "free", "hosted", "follow"] as const;

/** The four questions people ask about the prices, answered plainly, beside their heading. */
export function PricingFaq({ locale }: { locale: Locale }) {
  const { t } = getTranslator(locale);
  const tags = answerTags(locale);
  return (
    <Section labelledBy="pricing-faq-heading">
      <Columns
        widths="narrow"
        aside={<SectionHeading id="pricing-faq-heading" eyebrow={t("pricing.faq.eyebrow")} title={t("pricing.faq.heading")} />}
      >
        <FaqList
          items={QUESTIONS.map((id) => ({
            id,
            question: t(`pricing.faq.items.${id}.q`),
            answer: t.rich(`pricing.faq.items.${id}.a`, tags),
          }))}
        />
      </Columns>
    </Section>
  );
}
