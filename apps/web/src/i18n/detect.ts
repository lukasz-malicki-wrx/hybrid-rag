import { detectLocale as detect } from "@hybrid-rag/i18n";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./config";

/** First supported language in the browser's preference list (by base tag), else English. */
export function detectLocale(languages: readonly string[]): Locale {
  return detect(LOCALES, DEFAULT_LOCALE, languages);
}
