import { JsonLd } from "@/components/ui/json-ld";
import { SITE } from "@/config/site";
import { LOCALES } from "@/lib/i18n";
import { pagePath } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site-url";
import type { HomeSectionProps } from "./props";

/** SoftwareApplication for search engines. No `offers` and no ratings: there is no price and no review to state. */
export function HomeStructuredData({ t, locale }: HomeSectionProps) {
  return (
    <JsonLd
      data={{
        "@type": "SoftwareApplication",
        name: SITE.name,
        description: t("meta.home.description"),
        url: absoluteUrl(pagePath("home", locale)),
        applicationCategory: "UtilitiesApplication",
        operatingSystem: t("home.jsonLd.operatingSystem"),
        inLanguage: [...LOCALES],
        license: SITE.licence.url,
        isAccessibleForFree: true,
        author: { "@type": "Person", name: SITE.author.name, url: SITE.github },
        sameAs: [SITE.repo],
      }}
    />
  );
}
