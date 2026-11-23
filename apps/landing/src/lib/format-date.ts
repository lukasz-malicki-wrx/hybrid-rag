import type { Locale } from "./i18n";

/**
 * A calendar date ("2026-11-22") written the way the language does: "22 November 2026",
 * "22 listopada 2026". The date has no time zone, so it is read as UTC and shown as UTC and does not move a day.
 */
export function formatDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${isoDate}T00:00:00Z`));
}
