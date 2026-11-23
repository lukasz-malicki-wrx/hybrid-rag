"use client";

import { memo, useCallback } from "react";
import { ThemePill } from "@hybrid-rag/ui/theme-pill";
import { useTranslation } from "@/i18n/use-translation";
import { useThemeStore } from "@/stores/theme-store";
import { useResolvedDark } from "./use-resolved-dark";

/**
 * The light/dark pill of the rail. With the "system" preference it flips from what the device
 * shows; "system" itself is chosen in Settings.
 */
export const ThemeSwitch = memo(function ThemeSwitch() {
  const { t } = useTranslation();
  const dark = useResolvedDark();
  const setPreference = useThemeStore((s) => s.setPreference);
  const toggle = useCallback(() => setPreference(dark ? "light" : "dark"), [dark, setPreference]);
  return <ThemePill dark={dark} label={t(dark ? "rail.switchToLight" : "rail.switchToDark")} onToggle={toggle} />;
});
