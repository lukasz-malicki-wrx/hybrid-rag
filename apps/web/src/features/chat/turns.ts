import { isSameDay, type When } from "@/lib/format";

/**
 * Whether each moment starts a new calendar day compared with the one before it (the first
 * always does). Drives the day dividers between the turns of a conversation.
 */
export function startsOfDay(times: readonly When[], timeZone?: string): boolean[] {
  return times.map((time, i) => i === 0 || !isSameDay(times[i - 1], time, timeZone));
}

/**
 * The divider text to show before each moment: the label of its day when it starts a new day, else
 * undefined. A live turn is appended with the time it was sent, so a page left open past midnight
 * still gets the right day.
 */
export function dayDividers(times: readonly When[], label: (when: When) => string, timeZone?: string): (string | undefined)[] {
  return startsOfDay(times, timeZone).map((starts, i) => (starts ? label(times[i]) : undefined));
}

const SHORT_QUESTION = 60;

/** A short one-line question gets the rounder bubble; long or multi-line ones a squarer one. */
export function isShortQuestion(text: string): boolean {
  return text.length <= SHORT_QUESTION && !text.includes("\n");
}
