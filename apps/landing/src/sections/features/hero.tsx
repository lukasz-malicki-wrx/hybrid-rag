import { Screenshot } from "@/components/screenshot";
import { PageHeader } from "@/components/ui/page-header";
import type { Locale } from "@/lib/i18n";
import type { AppTranslator } from "@/lib/translator";

/** The top of the page: the label, the h1, the paragraph, and the chat beside them. */
export function FeaturesHero({ t, locale }: { t: AppTranslator["t"]; locale: Locale }) {
  return (
    <PageHeader
      eyebrow={t("features.hero.eyebrow")}
      title={t("features.hero.title")}
      lead={t("features.hero.lead")}
      media={<Screenshot id="hero-chat" locale={locale} eager sizes="(min-width: 1152px) 540px, 100vw" />}
    />
  );
}
