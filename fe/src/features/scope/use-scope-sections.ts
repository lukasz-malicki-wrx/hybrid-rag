"use client";

import { useMemo } from "react";
import { useDocuments } from "@/api/documents";
import type { DocumentInfo } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";

export type ScopeSection = { title: string; documents: DocumentInfo[] };

/** Active documents for the picker; in a group, the group's documents come first. */
export function useScopeSections(groupId?: string | null, groupName?: string | null) {
  const { t } = useTranslation();
  const all = useDocuments();
  const inGroup = useDocuments(groupId ?? undefined);

  return useMemo(() => {
    const docs = (all.data ?? []).filter((d) => d.active);
    if (!groupId) return { total: docs.length, sections: [{ title: t("scope.documents"), documents: docs }] };
    const ids = new Set((inGroup.data ?? []).map((d) => d.id));
    return {
      total: docs.length,
      sections: [
        { title: t("scope.inGroup", { name: groupName ?? "" }), documents: docs.filter((d) => ids.has(d.id)) },
        { title: t("scope.otherDocuments"), documents: docs.filter((d) => !ids.has(d.id)) },
      ].filter((s) => s.documents.length),
    };
  }, [all.data, inGroup.data, groupId, groupName, t]);
}
