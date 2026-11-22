"use client";

import { memo, useMemo } from "react";
import { RadioGroup, type RadioOption } from "@hybrid-rag/ui/radio-group";
import { useTranslation } from "@/i18n/use-translation";
import type { ThemePreference } from "@/lib/theme";

/** Appearance: light, dark or whatever the device uses. */
export const ThemeSelect = memo(function ThemeSelect({
  value,
  onChange,
}: {
  value: ThemePreference;
  onChange: (value: ThemePreference) => void;
}) {
  const { t } = useTranslation();
  const options = useMemo<RadioOption<ThemePreference>[]>(
    () => [
      { value: "light", label: t("settings.appearanceLight") },
      { value: "dark", label: t("settings.appearanceDark") },
      { value: "system", label: t("settings.appearanceSystem") },
    ],
    [t],
  );
  return (
    <RadioGroup legend={t("settings.appearance")} name="theme" options={options} value={value} onChange={onChange} />
  );
});
