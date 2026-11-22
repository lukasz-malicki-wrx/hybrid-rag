"use client";

import { useMemo } from "react";
import { relativeTime } from "@/lib/format";
import { createTranslator, type Translator } from "./translate";
import { useLocale } from "./use-locale";

export type TranslationHelpers = Translator & {
  /** "5 minutes ago", or "just now" under a minute. */
  timeAgo: (iso: string) => string;
};

export function useTranslation(): TranslationHelpers {
  const locale = useLocale();
  return useMemo(() => {
    const translator = createTranslator(locale);
    return {
      ...translator,
      timeAgo: (iso: string) => relativeTime(iso, locale) ?? translator.t("time.justNow"),
    };
  }, [locale]);
}
