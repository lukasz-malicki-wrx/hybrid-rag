"use client";

import { useDocuments } from "@/api/documents";
import type { DocumentInfo } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";
import { ColumnHeader } from "./column-header";
import { FilteredList } from "./filtered-list";
import { SidebarDocumentItem } from "./sidebar-document-item";

const filename = (d: DocumentInfo) => d.filename;

/** Documents: a filename filter and the documents with their processing status. */
export function DocumentsSection() {
  const { t } = useTranslation();
  const documents = useDocuments();
  return (
    <>
      <ColumnHeader title={t("sidebar.headingDocuments")} />
      <FilteredList
        items={documents.data}
        isError={documents.isError}
        text={filename}
        searchLabel={t("sidebar.searchDocuments")}
        errorMessage={t("sidebar.documentsError")}
        emptyMessage={t("sidebar.noDocuments")}
      >
        {(items) => (
          <ul className="space-y-1">
            {items.map((d) => (
              <SidebarDocumentItem key={d.id} doc={d} />
            ))}
          </ul>
        )}
      </FilteredList>
    </>
  );
}
