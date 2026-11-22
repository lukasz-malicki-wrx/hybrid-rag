"use client";

import { memo, useEffect } from "react";
import { useDocumentStatus } from "@/api/documents";
import { CloseIcon, FileIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";
import { useTranslation } from "@/i18n/use-translation";
import { AttachmentStatus } from "./attachment-status";
import type { PendingAttachment } from "./use-attachments";

type Props = {
  item: PendingAttachment;
  onUpdate: (key: string, changes: Partial<PendingAttachment>) => void;
  onRemove: (key: string) => void;
};

export const AttachmentChip = memo(function AttachmentChip({ item, onUpdate, onRemove }: Props) {
  const { t } = useTranslation();
  const live = useDocumentStatus(item.status === "processing" ? (item.documentId ?? null) : null);

  useEffect(() => {
    if (!live) return;
    onUpdate(item.key, {
      status: live.status,
      progress: live.progress_total ? { done: live.progress, total: live.progress_total } : undefined,
      error: live.status === "failed" ? (live.error ?? undefined) : undefined,
    });
  }, [live, item.key, onUpdate]);

  return (
    <li className="flex max-w-full items-center gap-2 rounded-lg border border-border bg-bg py-1 pl-2 pr-1 text-sm">
      <FileIcon className="shrink-0 text-muted" />
      <span className="min-w-0 max-w-48 truncate" title={item.name}>
        {item.name}
      </span>
      <AttachmentStatus item={item} />
      <IconButton
        label={t("composer.removeAttachment", { name: item.name })}
        icon={<CloseIcon width={14} height={14} />}
        onClick={() => onRemove(item.key)}
        className="p-1"
      />
    </li>
  );
});
