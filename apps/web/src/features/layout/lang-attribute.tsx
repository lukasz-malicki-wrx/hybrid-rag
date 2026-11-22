"use client";

import { useEffect } from "react";
import { useLocale } from "@/i18n/use-locale";

/** Keeps <html lang> in sync with the active language (screen readers use it). */
export function LangAttribute() {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
