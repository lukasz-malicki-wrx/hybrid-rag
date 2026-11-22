import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Locale } from "@/i18n/config";

export type LocalePreference = Locale | "auto";

type LocaleState = {
  preference: LocalePreference;
  setPreference: (preference: LocalePreference) => void;
};

/** The user's language choice, remembered in localStorage. "auto" follows the browser. */
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      preference: "auto",
      setPreference: (preference) => set({ preference }),
    }),
    { name: "hybrid-rag:locale", storage: createJSONStorage(() => localStorage) },
  ),
);
