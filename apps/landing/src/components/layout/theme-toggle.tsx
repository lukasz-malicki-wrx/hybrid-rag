"use client";

import { useCallback, useSyncExternalStore } from "react";
import { ThemePill } from "@hybrid-rag/ui/theme-pill";
import {
  applyTheme,
  parsePreference,
  resolveDark,
  serializePreference,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "@hybrid-rag/ui/theme";

const QUERY = "(prefers-color-scheme: dark)";
/** Fired on this page after a change, because the browser's "storage" event only reaches other tabs. */
const CHANGE_EVENT = "hybrid-rag:theme-change";

function readPreference(): ThemePreference {
  try {
    return parsePreference(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system"; // storage blocked: follow the device
  }
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

const getSnapshot = () => resolveDark(readPreference(), window.matchMedia(QUERY).matches);
/** The server cannot know the theme: light first, the real value after hydration. */
const getServerSnapshot = () => false;

/**
 * The light/dark pill. The choice is kept in localStorage under the key the app uses (the only
 * thing this site stores, and the privacy page says so); the inline script in the head applies it
 * before the first paint.
 */
export function ThemeToggle({ switchToLight, switchToDark }: { switchToLight: string; switchToDark: string }) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggle = useCallback(() => {
    const next: ThemePreference = dark ? "light" : "dark";
    try {
      localStorage.setItem(THEME_STORAGE_KEY, serializePreference(next));
    } catch {
      // Not saved (storage blocked): the choice still applies until the page is closed.
    }
    applyTheme(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, [dark]);
  return <ThemePill dark={dark} label={dark ? switchToLight : switchToDark} onToggle={toggle} orientation="horizontal" />;
}
