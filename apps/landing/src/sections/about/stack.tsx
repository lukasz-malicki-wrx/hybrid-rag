import { Columns } from "@/components/ui/columns";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/lib/i18n";
import { getTranslator } from "@/lib/translator";
import { DefinitionList } from "./definition-list";

const PARTS = ["search", "models", "backend", "web", "packaging", "site"] as const;

/** The technology, as plain facts about the parts. */
export function Stack({ locale }: { locale: Locale }) {
  const { t } = getTranslator(locale);
  return (
    <Section labelledBy="stack-heading" tone="panel">
      <Columns widths="narrow" aside={<SectionHeading id="stack-heading" title={t("about.stack.heading")} lead={t("about.stack.lead")} />}>
        <DefinitionList
          items={PARTS.map((id) => ({
            id,
            term: t(`about.stack.items.${id}.term`),
            detail: t(`about.stack.items.${id}.detail`),
          }))}
        />
      </Columns>
    </Section>
  );
}
