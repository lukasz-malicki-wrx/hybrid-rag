import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { DEFAULT_LOCALE, LOCALES, OG_LOCALES, type Locale } from "./i18n";
import { OG_SIZE, ogImagePath } from "./og-image";
import { pagePath, type PageId } from "./routes";
import { isIndexable } from "./site-url";
import { getTranslator } from "./translator";

/** hreflang links of a page: every language, plus x-default (the default language). Paths: the base URL is `metadataBase`. */
export function languageAlternates(id: PageId): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((l) => [l, pagePath(id, l)])),
    "x-default": pagePath(id, DEFAULT_LOCALE),
  };
}

/** The <title> of a page: the home page's own, the others with the site name after it. */
export function pageTitle(id: PageId, title: string): string {
  return id === "home" ? title : `${title} | ${SITE.name}`;
}

/**
 * Everything the head needs for one page in one language: title, description, canonical, hreflang
 * alternates, Open Graph, Twitter and robots. `generateMetadata` of every page calls this.
 */
export function buildMetadata(id: PageId, locale: Locale): Metadata {
  const { t } = getTranslator(locale);
  const description = t(`meta.${id}.description`);
  const title = pageTitle(id, t(`meta.${id}.title`));
  const path = pagePath(id, locale);
  const image = { url: ogImagePath(id, locale), ...OG_SIZE, alt: t("meta.og.alt", { title: t(`meta.${id}.title`), description }) };
  return {
    title,
    description,
    alternates: { canonical: path, languages: languageAlternates(id) },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title,
      description,
      url: path,
      locale: OG_LOCALES[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    robots: isIndexable() ? { index: true, follow: true } : { index: false, follow: false },
  };
}
