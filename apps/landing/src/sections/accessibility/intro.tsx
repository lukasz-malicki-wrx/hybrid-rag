import { UpdatedOn } from "@/components/legal/updated-on";
import { PageHeader } from "@/components/ui/page-header";
import { LEGAL } from "@/config/legal";
import type { Locale } from "@/lib/i18n";
import type { AppTranslator } from "@/lib/translator";

/** The top of the page: the h1, the aim, and the date of the statement. */
export function AccessibilityIntro({ t, locale }: { t: AppTranslator["t"]; locale: Locale }) {
  return (
    <PageHeader
      eyebrow={t("accessibility.hero.eyebrow")}
      title={t("accessibility.hero.title")}
      lead={t("accessibility.hero.lead")}
      actions={<UpdatedOn t={t} messageKey="accessibility.hero.updated" isoDate={LEGAL.accessibilityUpdated} locale={locale} />}
    />
  );
}
