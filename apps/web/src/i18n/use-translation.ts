"use client";

import { useMemo } from "react";
import { clockTime, dayLabel, relativeTime, shortTime, type When } from "@/lib/format";
import { createTranslator, type Translator } from "./translate";
import { useLocale } from "./use-locale";

export type TranslationHelpers = Translator & {
  /** "5 minutes ago", or "just now" under a minute. */
  timeAgo: (iso: string) => string;
  /** The time in a conversation list: "14:05" today, "Mon" this week, then "17 Oct". */
  shortTime: (iso: string) => string;
  /** The hour and minute of a message: "14:05". */
  clockTime: (when: When) => string;
  /** The text of a day divider: "Today", "Yesterday", or the date. */
  dayLabel: (iso: When) => string;
};

export function useTranslation(): TranslationHelpers {
  const locale = useLocale();
  return useMemo(() => {
    const translator = createTranslator(locale);
    return {
      ...translator,
      timeAgo: (iso: string) => relativeTime(iso, locale) ?? translator.t("time.justNow"),
      shortTime: (iso: string) => shortTime(iso, locale),
      clockTime: (when: When) => clockTime(when, locale),
      dayLabel: (iso: When) => {
        const label = dayLabel(iso, locale);
        return label.kind === "date" ? label.text : translator.t(label.kind === "today" ? "time.today" : "time.yesterday");
      },
    };
  }, [locale]);
}
