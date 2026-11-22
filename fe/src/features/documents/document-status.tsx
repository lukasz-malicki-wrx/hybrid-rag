"use client";

import { memo } from "react";
import { useDocumentStatus } from "@/api/documents";
import type { DocumentInfo } from "@/api/types";
import { AlertIcon, CheckIcon, SpinnerIcon } from "@/components/icons";
import { useTranslation } from "@/i18n/use-translation";

/** Status label for a document; follows progress live while it is being processed. */
export const DocumentStatus = memo(function DocumentStatus({ doc }: { doc: DocumentInfo }) {
  const { t } = useTranslation();
  const live = useDocumentStatus(doc.status === "processing" ? doc.id : null);
  const status = live?.status ?? doc.status;
  const progress = live?.progress ?? doc.progress;
  const total = live?.progress_total ?? doc.progress_total;

  if (status === "ready")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-ok">
        <CheckIcon width={14} height={14} />
        {t("document.ready")}
      </span>
    );
  if (status === "failed")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-danger" title={doc.error ?? undefined}>
        <AlertIcon width={14} height={14} />
        {t("document.failed")}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted">
      <SpinnerIcon width={14} height={14} />
      {total ? t("document.indexing", { progress, total }) : t("document.queued")}
    </span>
  );
});
