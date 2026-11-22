import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

/** First supported language in the browser's preference list (by base tag), else English. */
export function detectLocale(languages: readonly string[]): Locale {
  for (const tag of languages) {
    const base = tag.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
