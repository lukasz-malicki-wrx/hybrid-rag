"use client";

import { memo } from "react";
import { documentsApi } from "@/api/documents";
import { FileIcon } from "@/components/icons";
import { useTranslation } from "@/i18n/use-translation";

export type QuestionFile = { id: string; filename: string; active?: boolean };

/** Files sent with a question, shown above it (links open the original PDF). */
export const QuestionFiles = memo(function QuestionFiles({ files }: { files: QuestionFile[] }) {
  const { t } = useTranslation();
  if (!files.length) return null;
  return (
    <ul aria-label={t("composer.attachedFiles")} className="flex flex-wrap justify-end gap-2">
      {files.map((f) => (
        <li key={f.id}>
          {f.active === false ? (
            <span
              title={f.filename}
              className="inline-flex max-w-64 items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm text-muted"
            >
              <FileIcon className="shrink-0" />
              <span className="truncate line-through">{f.filename}</span>
              <span className="sr-only">{t("files.removed")}</span>
            </span>
          ) : (
            <a
              href={documentsApi.fileUrl(f.id)}
              target="_blank"
              rel="noreferrer"
              title={f.filename}
              className="inline-flex max-w-64 items-center gap-2 rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm hover:bg-surface-2"
            >
              <FileIcon className="shrink-0 text-muted" />
              <span className="truncate">{f.filename}</span>
              <span className="sr-only"> {t("files.opensPdf")}</span>
            </a>
          )}
        </li>
      ))}
    </ul>
  );
});
