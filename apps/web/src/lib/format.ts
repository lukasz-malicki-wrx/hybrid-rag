const STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/**
 * "5 minutes ago" / "5 minut temu". Returns null under a minute, so the caller can show its
 * own "just now" text.
 */
export function relativeTime(iso: string, locale: string, now: number = Date.now()): string | null {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, size] of STEPS) {
    if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  }
  return null;
}

/** A point in time as an ISO string, a Date or epoch milliseconds. */
export type When = string | number | Date;

/** `timeZone` is an IANA name ("Europe/Warsaw"); omitted, it is the time zone of the device. */
function dayParts(when: When, timeZone?: string): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "numeric", day: "numeric" })
    .formatToParts(new Date(when));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

/** Whole calendar days from `a` to `b` in the time zone (not 24-hour periods: 23:50 to 00:10 is 1). */
function daysBetween(a: When, b: When, timeZone?: string): number {
  const [x, y] = [a, b].map((when) => {
    const { year, month, day } = dayParts(when, timeZone);
    return Date.UTC(year, month - 1, day);
  });
  return Math.round((y - x) / 86_400_000);
}

/** Whether both moments fall on the same calendar day in the time zone. */
export function isSameDay(a: When, b: When, timeZone?: string): boolean {
  return daysBetween(a, b, timeZone) === 0;
}

function formatDate(when: When, locale: string, now: When, timeZone?: string): string {
  const sameYear = dayParts(when, timeZone).year === dayParts(now, timeZone).year;
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  }).format(new Date(when));
}

/** The hour and minute of a moment ("14:05"); the day is the divider's job. */
export function clockTime(when: When, locale: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(locale, { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(
    new Date(when),
  );
}

/**
 * The time of a conversation in a list: the hour for today ("14:05"), the weekday for the last
 * six days ("Mon" / "pon."), then the date ("17 Oct" / "17 paź", with the year when it is not
 * this year). A time in the future (a clock that is off) counts as today.
 */
export function shortTime(iso: When, locale: string, now: When = Date.now(), timeZone?: string): string {
  const days = daysBetween(iso, now, timeZone);
  if (days <= 0) return clockTime(iso, locale, timeZone);
  if (days < 7) return new Intl.DateTimeFormat(locale, { timeZone, weekday: "short" }).format(new Date(iso));
  return formatDate(iso, locale, now, timeZone);
}

export type DayLabel = { kind: "today" } | { kind: "yesterday" } | { kind: "date"; text: string };

/**
 * What the divider between two days of a conversation says. Today and yesterday are returned as
 * a kind so the caller translates them; any other day is already formatted ("17 Oct 2025").
 */
export function dayLabel(iso: When, locale: string, now: When = Date.now(), timeZone?: string): DayLabel {
  const days = daysBetween(iso, now, timeZone);
  if (days <= 0) return { kind: "today" };
  if (days === 1) return { kind: "yesterday" };
  return { kind: "date", text: formatDate(iso, locale, now, timeZone) };
}
