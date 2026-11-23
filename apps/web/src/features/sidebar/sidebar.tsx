"use client";

import { cn } from "@hybrid-rag/ui/cn";
import { IconButton } from "@hybrid-rag/ui/icon-button";
import { CloseIcon } from "@hybrid-rag/ui/icons";
import { useTranslation } from "@/i18n/use-translation";
import { Rail } from "./rail";
import { SidebarColumn } from "./sidebar-column";
import { useSidebarDrawer } from "./use-sidebar-drawer";

/**
 * From `lg` up: the 64px icon rail and the 320px column, side by side. Below it the same content
 * is a drawer from the left; while closed it is `invisible`, so nothing in it can be tabbed to.
 */
export function Sidebar() {
  const { t } = useTranslation();
  const { open, close, focusTarget } = useSidebarDrawer();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label={t("app.closeMenu")}
          tabIndex={-1}
          onClick={close}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}
      <aside
        id="sidebar"
        aria-label={t("sidebar.label")}
        onKeyDown={(e) => e.key === "Escape" && open && close()}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-96 max-w-[85vw] border-r border-border bg-bg lg:static lg:w-96 lg:max-w-none lg:translate-x-0 lg:border-r-0",
          // Opening shows it at once (focus moves into it right away, and a transitioning
          // `visibility` would still be hidden at that moment); closing waits for the slide.
          open
            ? "translate-x-0 motion-safe:transition-transform"
            : "-translate-x-full max-lg:invisible motion-safe:transition-[transform,visibility]",
        )}
      >
        <Rail />
        <nav
          aria-label={t("sidebar.navigation")}
          className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 px-4 pb-0 pt-4"
        >
          <div className="flex justify-end lg:hidden">
            <IconButton
              ref={focusTarget}
              variant="tile"
              label={t("app.closeMenu")}
              icon={<CloseIcon />}
              onClick={close}
            />
          </div>
          <SidebarColumn />
        </nav>
      </aside>
    </>
  );
}
