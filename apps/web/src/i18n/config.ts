import { isLocaleOf } from "@hybrid-rag/i18n";

export const LOCALES = ["en", "pl"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return isLocaleOf(LOCALES, value);
}
