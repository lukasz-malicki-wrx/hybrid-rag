"use client";

import { useEffect } from "react";
import { applyTheme } from "@/lib/theme";
import { useThemeStore } from "@/stores/theme-store";

/**
 * Keeps <html data-theme> in sync with the chosen theme. Subscribes to the store directly:
 * the hook returns the default during hydration, which would briefly undo the head script.
 */
export function ThemeAttribute() {
  useEffect(() => {
    applyTheme(useThemeStore.getState().preference);
    return useThemeStore.subscribe((s) => applyTheme(s.preference));
  }, []);
  return null;
}
