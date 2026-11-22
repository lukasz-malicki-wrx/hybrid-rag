"use client";

import { memo, useMemo } from "react";
import { RadioGroup, type RadioOption } from "@/components/ui/radio-group";
import { LOCALES } from "@/i18n/config";
import { useTranslation } from "@/i18n/use-translation";
import type { LocalePreference } from "@/stores/locale-store";

export const LanguageSelect = memo(function LanguageSelect({
  value,
  onChange,
}: {
  value: LocalePreference;
  onChange: (value: LocalePreference) => void;
}) {
  const { t } = useTranslation();
  const options = useMemo<RadioOption<LocalePreference>[]>(
    () => [
      { value: "auto", label: t("settings.languageAuto") },
      ...LOCALES.map((locale) => ({ value: locale, label: t(`languages.${locale}`) })),
    ],
    [t],
  );
  return (
    <RadioGroup legend={t("settings.language")} name="language" options={options} value={value} onChange={onChange} />
  );
});
