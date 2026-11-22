"use client";

import { memo, useCallback, useId, type ChangeEvent } from "react";
import { ChevronDownIcon } from "@hybrid-rag/ui/icons";
import { LOCALES, isLocale } from "@/i18n/config";
import { useLocale } from "@/i18n/use-locale";
import { useTranslation } from "@/i18n/use-translation";
import { useLocaleStore } from "@/stores/locale-store";

/** Compact language switch for the sidebar footer. The choice is remembered. */
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
    <div className="relative inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-medium focus-within:outline-2 focus-within:outline-focus hover:bg-surface-2">
      <span aria-hidden="true">{locale.toUpperCase()}</span>
      <ChevronDownIcon width={14} height={14} className="text-muted" />
      <label htmlFor={id} className="sr-only">
        {t("settings.language")}
      </label>
      <select
        id={id}
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
