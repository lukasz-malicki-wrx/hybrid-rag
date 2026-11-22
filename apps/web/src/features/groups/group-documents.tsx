"use client";

import { useCallback } from "react";
import { Heading } from "@hybrid-rag/ui/heading";
import { Text } from "@hybrid-rag/ui/text";
import { useDocuments } from "@/api/documents";
import { useRemoveFromGroup } from "@/api/groups";
import { useTranslation } from "@/i18n/use-translation";
import { GroupDocumentItem } from "./group-document-item";

export function GroupDocuments({ groupId }: { groupId: string }) {
  const { t } = useTranslation();
  const documents = useDocuments(groupId);
  const removeFromGroup = useRemoveFromGroup();
  const remove = useCallback(
    (documentId: string) => removeFromGroup.mutate({ groupId, documentId }),
    [removeFromGroup, groupId],
  );

  return (
    <section aria-labelledby="group-documents">
      <Heading id="group-documents" className="mb-3">
        {t("groups.documents")}
      </Heading>
      {documents.data?.length ? (
        <ul className="space-y-2">
          {documents.data.map((d) => (
            <GroupDocumentItem key={d.id} doc={d} onRemove={remove} />
          ))}
        </ul>
      ) : (
        <Text tone="muted">{t("groups.noDocuments")}</Text>
      )}
    </section>
  );
}
