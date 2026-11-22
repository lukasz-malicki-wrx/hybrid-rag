"use client";

import { useTranslation } from "@/i18n/use-translation";

/** "Searching all documents" / "Searching group “med”" / "Searching 2 selected documents". */
export function useScopeLabel(selectedCount: number, groupName?: string | null): string {
  const { t, tp } = useTranslation();
  if (selectedCount) return tp("scope.selected", selectedCount);
  return groupName ? t("scope.group", { name: groupName }) : t("scope.all");
}
