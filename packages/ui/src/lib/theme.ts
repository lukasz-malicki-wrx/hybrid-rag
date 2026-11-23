/** Theme logic shared by the app and the landing page. Plain TypeScript: no React, no store. */

export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "hybrid-rag:theme";

const PREFERENCES: readonly ThemePreference[] = ["light", "dark", "system"];

/** Sets <html data-theme>; without it the colours follow the system (see design-tokens theme.css). */
export function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  if (preference === "system") {
    delete root.dataset.theme;
    return;
  }
  root.dataset.theme = preference;
}

/** Whether the dark colours are showing: the saved choice, or the device when it is "system". */
export function resolveDark(preference: ThemePreference, systemDark: boolean): boolean {
  return preference === "system" ? systemDark : preference === "dark";
}

/**
 * The stored value is `{"state":{"preference":"dark"},"version":0}`, the shape the app's zustand
 * `persist` middleware writes, so both sites read and write the same thing.
 */
export function serializePreference(preference: ThemePreference): string {
  return JSON.stringify({ state: { preference }, version: 0 });
}

/** The saved choice, or "system" when nothing (valid) is saved. */
export function parsePreference(raw: string | null): ThemePreference {
  if (!raw) return "system";
  try {
    const preference: unknown = JSON.parse(raw)?.state?.preference;
    return PREFERENCES.find((p) => p === preference) ?? "system";
  } catch {
    return "system";
  }
}

/**
 * Runs in <head> before the first paint, so a saved theme does not flash in after hydration.
 * Reads what the stores persist. The inline script has to be allowed by the page's CSP (nonce).
 */
export const THEME_SCRIPT = `try{var p=JSON.parse(localStorage.getItem("${THEME_STORAGE_KEY}")).state.preference;if(p==="light"||p==="dark")document.documentElement.dataset.theme=p}catch(e){}`;
