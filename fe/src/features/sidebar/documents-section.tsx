"use client";

import { useDocuments } from "@/api/documents";
import { useTranslation } from "@/i18n/use-translation";
import { SidebarDocumentItem } from "./sidebar-document-item";
import { SidebarEmpty } from "./sidebar-empty";
import { SidebarSection } from "./sidebar-section";

export function DocumentsSection() {
  const { t } = useTranslation();
  const documents = useDocuments();
  return (
    <SidebarSection title={t("sidebar.documents")}>
      {documents.data?.length ? (
        <ul className="space-y-0.5">
          {documents.data.map((d) => (
            <SidebarDocumentItem key={d.id} doc={d} />
          ))}
        </ul>
      ) : (
        <SidebarEmpty>{t(documents.isError ? "sidebar.documentsError" : "sidebar.noDocuments")}</SidebarEmpty>
      )}
    </SidebarSection>
  );
}
