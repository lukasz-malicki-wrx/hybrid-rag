"use client";

import Link from "next/link";
import { CloseIcon, PlusIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";
import { LanguageSwitcher } from "@/features/settings/language-switcher";
import { SettingsButton } from "@/features/settings/settings-button";
import { useTranslation } from "@/i18n/use-translation";
import { cn } from "@/lib/cn";
import { DocumentsSection } from "./documents-section";
import { FavouritesSection } from "./favourites-section";
import { GroupsSection } from "./groups-section";
import { RecentSection } from "./recent-section";
import { ToolsSection } from "./tools-section";
import { useSidebarDrawer } from "./use-sidebar-drawer";

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
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}
      <aside
        id="sidebar"
        aria-label={t("sidebar.label")}
        onKeyDown={(e) => e.key === "Escape" && open && close()}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col border-r border-border bg-surface transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2 p-3">
          <Link
            href="/"
            className="flex min-h-10 flex-1 items-center gap-2 rounded-lg border border-border bg-bg px-3 text-sm font-medium hover:bg-surface-2"
          >
            <PlusIcon />
            {t("sidebar.newConversation")}
          </Link>
          <IconButton
            ref={focusTarget}
            label={t("app.closeMenu")}
            icon={<CloseIcon />}
            onClick={close}
            className="md:hidden"
          />
        </div>

        <nav aria-label={t("sidebar.navigation")} className="relative flex-1 space-y-5 overflow-y-auto px-2 pb-6">
          <FavouritesSection />
          <GroupsSection />
          <RecentSection />
          <DocumentsSection />
          <ToolsSection />
        </nav>

        <div className="flex items-center gap-1 border-t border-border p-2">
          <div className="min-w-0 flex-1">
            <SettingsButton />
          </div>
          <span aria-hidden="true" className="h-6 w-px bg-border" />
          <LanguageSwitcher />
        </div>
      </aside>
    </>
  );
}
