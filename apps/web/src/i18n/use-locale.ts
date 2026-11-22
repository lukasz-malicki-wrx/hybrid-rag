"use client";

import { useSyncExternalStore } from "react";
import { useLocaleStore } from "@/stores/locale-store";
import { DEFAULT_LOCALE, type Locale } from "./config";
import { detectLocale } from "./detect";

function subscribe(onChange: () => void) {
  const unsubscribe = useLocaleStore.subscribe(onChange);
  window.addEventListener("languagechange", onChange);
  return () => {
    unsubscribe();
    window.removeEventListener("languagechange", onChange);
  };
}

function getSnapshot(): Locale {
  const { preference } = useLocaleStore.getState();
  return preference === "auto" ? detectLocale(navigator.languages) : preference;
}

const getServerSnapshot = (): Locale => DEFAULT_LOCALE;

/**
 * The active language: the user's choice, else the browser's, else English. The server renders
 * English; useSyncExternalStore switches after hydration without a hydration mismatch.
 */
export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
