"use client";

import { SearchIcon } from "@hybrid-rag/ui/icons";
import { useTranslation } from "@/i18n/use-translation";
import { SidebarLink } from "./sidebar-link";
import { SidebarSection } from "./sidebar-section";

export function ToolsSection() {
  const { t } = useTranslation();
  return (
    <SidebarSection title={t("sidebar.tools")}>
      <SidebarLink href="/search" icon={<SearchIcon />}>
        {t("sidebar.searchLab")}
      </SidebarLink>
    </SidebarSection>
  );
}
