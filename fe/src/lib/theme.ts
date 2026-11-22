export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "hybrid-rag:theme";

/** Sets <html data-theme>; without it the colours follow the system (see globals.css). */
export function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  if (preference === "system") {
    delete root.dataset.theme;
    return;
  }
  root.dataset.theme = preference;
}

/**
 * Runs in <head> before the first paint, so a saved theme does not flash in after hydration.
 * Reads what the theme store persists.
 */
export const THEME_SCRIPT = `try{var p=JSON.parse(localStorage.getItem("${THEME_STORAGE_KEY}")).state.preference;if(p==="light"||p==="dark")document.documentElement.dataset.theme=p}catch(e){}`;
