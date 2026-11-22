"use client";

import { memo } from "react";
import { Checkbox } from "@hybrid-rag/ui/checkbox";
import type { DocumentInfo } from "@/api/types";
import type { Translator } from "@/i18n/translate";
import { useTranslation } from "@/i18n/use-translation";

function describe(doc: DocumentInfo, attached: boolean, t: Translator["t"]): string {
  if (attached) return t("scope.attachedToMessage");
  if (doc.status === "ready") return t("scope.version", { version: doc.version });
  if (doc.status === "failed") return t("scope.indexingFailed");
  return t("scope.stillIndexing");
}

export const ScopeOption = memo(function ScopeOption({
  doc,
  checked,
  attached,
  onToggle,
}: {
  doc: DocumentInfo;
  checked: boolean;
  attached: boolean;
  onToggle: (id: string, on: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <li>
      <Checkbox
        label={doc.filename}
        description={describe(doc, attached, t)}
        checked={attached || checked}
        disabled={attached}
        onChange={(e) => onToggle(doc.id, e.target.checked)}
      />
    </li>
  );
});
