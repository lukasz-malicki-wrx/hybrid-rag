"use client";

import { memo, type Ref } from "react";
import { documentsApi } from "@/api/documents";
import type { Source } from "@/api/types";
import { ExternalIcon } from "@/components/icons";
import { useTranslation } from "@/i18n/use-translation";
import { cn } from "@/lib/cn";

export const SourceCard = memo(function SourceCard({
  source,
  selected,
  ref,
}: {
  source: Source;
  selected: boolean;
  ref?: Ref<HTMLElement>;
}) {
  const { t } = useTranslation();
  return (
    <article
      ref={ref}
      aria-current={selected ? "true" : undefined}
      className={cn("rounded-xl border p-3 text-sm", selected ? "border-accent ring-1 ring-accent" : "border-border")}
    >
      <header className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-medium">
          <span className="mr-1 text-accent">[{source.n}]</span>
          {source.filename}
          <span className="block text-xs font-normal text-muted">
            {t("sources.page", { page: source.page, version: source.version })}
          </span>
        </h3>
        <a
          href={documentsApi.fileUrl(source.document_id, source.page)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-accent hover:bg-surface-2"
        >
          {t("sources.openPdf")}
          <ExternalIcon width={14} height={14} />
          <span className="sr-only"> {t("sources.openPdfLabel", { filename: source.filename, page: source.page })}</span>
        </a>
      </header>
      <blockquote className="max-h-48 overflow-y-auto whitespace-pre-wrap border-l-2 border-border pl-3 text-muted">
        {source.text}
      </blockquote>
    </article>
  );
});
