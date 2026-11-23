import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { THEME_STORAGE_KEY, type ThemePreference } from "@hybrid-rag/ui/theme";

type ThemeState = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

/** The user's theme choice, remembered in localStorage. "system" follows the device. */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: "system",
      setPreference: (preference) => set({ preference }),
    }),
    { name: THEME_STORAGE_KEY, storage: createJSONStorage(() => localStorage) },
  ),
);
