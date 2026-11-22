"use client";

import { memo } from "react";
import { cn } from "@hybrid-rag/ui/cn";
import { AlertIcon, CheckIcon, SpinnerIcon } from "@hybrid-rag/ui/icons";
import { useTranslation } from "@/i18n/use-translation";
import type { Translator } from "@/i18n/translate";
import type { AttachmentStatus as Status, PendingAttachment } from "./use-attachments";

const APPEARANCE: Record<Status, { Icon: typeof CheckIcon; className: string }> = {
  uploading: { Icon: SpinnerIcon, className: "text-muted" },
  processing: { Icon: SpinnerIcon, className: "text-muted" },
  ready: { Icon: CheckIcon, className: "text-ok" },
  failed: { Icon: AlertIcon, className: "text-danger" },
};

function statusLabel({ status, progress, error }: PendingAttachment, t: Translator["t"]): string {
  if (status === "uploading") return t("document.uploading");
  if (status === "ready") return t("document.ready");
  if (status === "failed") return error ?? t("document.processingFailed");
  if (!progress) return t("document.queued");
  return t("document.indexing", { progress: progress.done, total: progress.total });
}

/** Upload and indexing state of one attached file: icon and text. */
export const AttachmentStatus = memo(function AttachmentStatus({ item }: { item: PendingAttachment }) {
  const { t } = useTranslation();
  const { Icon, className } = APPEARANCE[item.status];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 text-xs", className)}>
      <Icon width={14} height={14} />
      <span className="max-w-40 truncate">{statusLabel(item, t)}</span>
    </span>
  );
});
