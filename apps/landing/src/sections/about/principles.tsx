import { Columns } from "@/components/ui/columns";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/lib/i18n";
import { getTranslator } from "@/lib/translator";
import { DefinitionList } from "./definition-list";

const PRINCIPLES = ["sources", "unknown", "local", "honest", "access"] as const;

/** What the project will not trade away. */
export function Principles({ locale }: { locale: Locale }) {
  const { t } = getTranslator(locale);
  return (
    <Section labelledBy="principles-heading">
      <Columns widths="narrow" aside={<SectionHeading id="principles-heading" title={t("about.principles.heading")} />}>
        <DefinitionList
          items={PRINCIPLES.map((id) => ({
            id,
            term: t(`about.principles.items.${id}.title`),
            detail: t(`about.principles.items.${id}.text`),
          }))}
        />
      </Columns>
    </Section>
  );
}
