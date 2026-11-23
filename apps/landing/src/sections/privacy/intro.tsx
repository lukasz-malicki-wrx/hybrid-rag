import { UpdatedOn } from "@/components/legal/updated-on";
import { PageHeader } from "@/components/ui/page-header";
import { LEGAL } from "@/config/legal";
import type { Locale } from "@/lib/i18n";
import type { AppTranslator } from "@/lib/translator";

/** The top of the page: the h1, what the page is, and when it was last checked. */
export function PrivacyIntro({ t, locale }: { t: AppTranslator["t"]; locale: Locale }) {
  return (
    <PageHeader
      eyebrow={t("privacy.hero.eyebrow")}
      title={t("privacy.hero.title")}
      lead={t("privacy.hero.lead")}
      actions={<UpdatedOn t={t} messageKey="privacy.hero.updated" isoDate={LEGAL.privacyUpdated} locale={locale} />}
    />
  );
}
