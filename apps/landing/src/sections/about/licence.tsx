import { Text } from "@hybrid-rag/ui/text";
import { Columns } from "@/components/ui/columns";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/lib/i18n";
import { getTranslator } from "@/lib/translator";
import { answerTags } from "@/components/rich-tags";

export function Licence({ locale }: { locale: Locale }) {
  const { t } = getTranslator(locale);
  return (
    <Section labelledBy="licence-heading" tone="panel">
      <Columns aside={<SectionHeading id="licence-heading" title={t("about.licence.heading")} />}>
        <Text size="lead" className="max-w-copy">
          {t.rich("about.licence.text", answerTags(locale))}
        </Text>
      </Columns>
    </Section>
  );
}
