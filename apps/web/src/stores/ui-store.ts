import { create } from "zustand";

/** The list the sidebar column shows; the icon rail switches between them. */
export type Section = "chats" | "groups" | "documents";

type UiState = {
  /** Mobile sidebar drawer. */
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  /** The section of the sidebar column. Not persisted: the route decides it on load. */
  section: Section;
  /** The route a section was last picked on in the rail (not by the route); `null` when none. */
  pickedOn: string | null;
  /** The rail picks a section while on `pathname`. The pick is over at the next route change. */
  pickSection: (section: Section, pathname: string) => void;
  /** The route changed: the section it belongs to (if any) is shown and an earlier pick is over. */
  followRoute: (pathname: string, section: Section | null) => void;
};

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: false,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  section: "chats",
  pickedOn: null,
  pickSection: (section, pathname) => set({ section, pickedOn: pathname }),
  followRoute: (pathname, section) =>
    set((s) => ({
      ...(section ? { section } : null),
      ...(s.pickedOn !== null && s.pickedOn !== pathname ? { pickedOn: null } : null),
    })),
}));
