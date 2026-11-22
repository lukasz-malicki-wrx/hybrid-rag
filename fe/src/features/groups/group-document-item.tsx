"use client";

import { memo } from "react";
import type { DocumentInfo } from "@/api/types";
import { CloseIcon, FileIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";
import { DocumentStatus } from "@/features/documents/document-status";
import { useTranslation } from "@/i18n/use-translation";

export const GroupDocumentItem = memo(function GroupDocumentItem({
  doc,
  onRemove,
}: {
  doc: DocumentInfo;
  onRemove: (documentId: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <li className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
      <FileIcon className="shrink-0 text-muted" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{doc.filename}</span>
        <DocumentStatus doc={doc} />
      </span>
      <IconButton
        label={t("groups.removeDocument", { filename: doc.filename })}
        icon={<CloseIcon />}
        tone="danger"
        onClick={() => onRemove(doc.id)}
      />
    </li>
  );
});
