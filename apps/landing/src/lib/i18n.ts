import { isLocaleOf, negotiateLocale as negotiate } from "@hybrid-rag/i18n";

export const LOCALES = ["en", "pl"] as const;
export type Locale = (typeof LOCALES)[number];

/** Served for "/" when no language in Accept-Language is supported, and as hreflang x-default. */
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return isLocaleOf(LOCALES, value);
}

/** Open Graph locale codes (language and territory). Not text anyone reads. */
export const OG_LOCALES: Record<Locale, string> = { en: "en_US", pl: "pl_PL" };

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "pl" : "en";
}

/** The language of an Accept-Language header (see `negotiateLocale` in @hybrid-rag/i18n). */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  return negotiate(LOCALES, DEFAULT_LOCALE, acceptLanguage);
}
