"use client";

import { useSyncExternalStore } from "react";
import { useThemeStore } from "@/stores/theme-store";
import { resolveDark } from "@hybrid-rag/ui/theme";

const QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  const unsubscribe = useThemeStore.subscribe(onChange);
  return () => {
    media.removeEventListener("change", onChange);
    unsubscribe();
  };
}

const getSnapshot = () => resolveDark(useThemeStore.getState().preference, window.matchMedia(QUERY).matches);
/** The server (and the hydrating client) cannot know the theme: light, then the real value. */
const getServerSnapshot = () => false;

/** Whether the dark theme is showing right now; hydration-safe. */
export function useResolvedDark(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
