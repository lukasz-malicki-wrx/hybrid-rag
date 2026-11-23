import { Text } from "@hybrid-rag/ui/text";
import { Section } from "@/components/ui/section";
import type { Locale } from "@/lib/i18n";
import { getTranslator } from "@/lib/translator";
import { answerTags } from "@/components/rich-tags";

/** Where to go when the question is not in the list. */
export function FaqMore({ locale }: { locale: Locale }) {
  const { t } = getTranslator(locale);
  return (
    <Section labelledBy="faq-more" tone="panel" spacing="tight">
      <Text id="faq-more" size="lead" className="mx-auto max-w-copy text-center">
        {t.rich("faq.more", answerTags(locale))}
      </Text>
    </Section>
  );
}
