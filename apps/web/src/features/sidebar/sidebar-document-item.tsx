"use client";

import Link from "next/link";
import { memo } from "react";
import { FileIcon } from "@hybrid-rag/ui/icons";
import type { DocumentInfo } from "@/api/types";
import { DocumentStatus } from "@/features/documents/document-status";
import { useTranslation } from "@/i18n/use-translation";

export const SidebarDocumentItem = memo(function SidebarDocumentItem({ doc }: { doc: DocumentInfo }) {
  const { t } = useTranslation();
  return (
    <li className="flex items-center gap-2 min-h-10 rounded-lg px-4 py-2 text-sm hover:bg-surface-2">
      <FileIcon width={12} height={12} className="shrink-0 text-muted" />
      <span className="min-w-0 flex-1">
        {doc.status === "ready" ? (
          <Link
            href={`/d/${doc.id}`}
            className="block truncate font-medium hover:underline"
            title={t("sidebar.documentTitle", { filename: doc.filename, version: doc.version })}
          >
            {doc.filename}
          </Link>
        ) : (
          <span className="block truncate">{doc.filename}</span>
        )}
        <DocumentStatus doc={doc} />
      </span>
    </li>
  );
});
