"use client";

import { memo, useCallback, useId, type ChangeEvent } from "react";
import { LOCALES, isLocale } from "@/i18n/config";
import { useLocale } from "@/i18n/use-locale";
import { useTranslation } from "@/i18n/use-translation";
import { useLocaleStore } from "@/stores/locale-store";

/** Compact language switch for the rail. The choice is remembered. */
export const LanguageSwitcher = memo(function LanguageSwitcher() {
  const { t } = useTranslation();
  const locale = useLocale();
  const setPreference = useLocaleStore((s) => s.setPreference);
  const id = useId();

  const change = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      if (isLocale(e.target.value)) setPreference(e.target.value);
    },
    [setPreference],
  );

  // The visible part is just the code ("EN"); a transparent native <select> on top keeps
  // keyboard, screen reader and mobile pickers working, and lists the full language names.
  return (
    <div className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface text-xs font-semibold text-muted focus-within:outline-2 focus-within:outline-focus hover:bg-surface-2 hover:text-fg">
      <span aria-hidden="true">{locale.toUpperCase()}</span>
      <label htmlFor={id} className="sr-only">
        {t("settings.language")}
      </label>
      <select
        id={id}
        title={t("settings.language")}
        value={locale}
        onChange={change}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0"
      >
        {LOCALES.map((code) => (
          <option key={code} value={code} lang={code}>
            {t(`languages.${code}`)}
          </option>
        ))}
      </select>
    </div>
  );
});
