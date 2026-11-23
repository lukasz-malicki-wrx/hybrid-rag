import { beforeEach, describe, expect, it } from "vitest";
import { useUiStore } from "./ui-store";

describe("ui store", () => {
  beforeEach(() => useUiStore.setState({ sidebarOpen: false, section: "chats", pickedOn: null }));

  it("starts on the chats section", () => {
    expect(useUiStore.getState().section).toBe("chats");
  });

  it("switches section without touching the drawer", () => {
    useUiStore.getState().openSidebar();
    useUiStore.getState().pickSection("documents", "/");
    expect(useUiStore.getState()).toMatchObject({ section: "documents", sidebarOpen: true });
  });

  it("opens and closes the drawer", () => {
    useUiStore.getState().openSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(true);
    useUiStore.getState().closeSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(false);
  });

  it("ends a rail pick at the next route change, and only then", () => {
    const { pickSection, followRoute } = useUiStore.getState();
    pickSection("groups", "/search");
    followRoute("/search", null);
    expect(useUiStore.getState()).toMatchObject({ section: "groups", pickedOn: "/search" });
    followRoute("/c/c1", "chats");
    expect(useUiStore.getState()).toMatchObject({ section: "chats", pickedOn: null });
  });

  it("keeps the section on a route that belongs to none", () => {
    useUiStore.getState().pickSection("documents", "/");
    useUiStore.getState().followRoute("/search", null);
    expect(useUiStore.getState().section).toBe("documents");
  });
});
