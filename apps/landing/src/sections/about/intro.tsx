import { Screenshot } from "@/components/screenshot";
import { PageHeader } from "@/components/ui/page-header";
import { SITE } from "@/config/site";
import type { Locale } from "@/lib/i18n";
import type { AppTranslator } from "@/lib/translator";

/** The top of the page: the label, the h1, the paragraph, and the sources panel beside them. */
export function AboutIntro({ t, locale }: { t: AppTranslator["t"]; locale: Locale }) {
  return (
    <PageHeader
      eyebrow={t("about.hero.eyebrow")}
      title={t("about.hero.title")}
      lead={t("about.hero.lead", { author: SITE.author.name })}
      media={<Screenshot id="sources" locale={locale} eager sizes="(min-width: 1152px) 540px, 100vw" />}
    />
  );
}
