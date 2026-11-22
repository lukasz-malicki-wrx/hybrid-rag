"use client";

import { MenuIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";
import { useTranslation } from "@/i18n/use-translation";
import { useUiStore } from "@/stores/ui-store";

export function MobileHeader() {
  const { t } = useTranslation();
  const open = useUiStore((s) => s.sidebarOpen);
  const openSidebar = useUiStore((s) => s.openSidebar);
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-2 md:hidden">
      <IconButton
        label={t("app.openMenu")}
        icon={<MenuIcon />}
        onClick={openSidebar}
        aria-expanded={open}
        aria-controls="sidebar"
        className="text-fg"
      />
      <span className="font-semibold">{t("app.name")}</span>
    </header>
  );
}
