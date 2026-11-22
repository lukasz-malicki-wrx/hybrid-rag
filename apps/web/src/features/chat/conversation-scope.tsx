"use client";

import { memo, useCallback, useMemo } from "react";
import { useSetConversationDocuments } from "@/api/conversations";
import type { DocumentRef } from "@/api/types";
import { ScopePicker } from "@/features/scope/scope-picker";

/** Scope control of an existing conversation: its pinned documents, saved on change. */
export const ConversationScope = memo(function ConversationScope({
  conversationId,
  pinned,
  attached,
  groupId,
  groupName,
}: {
  conversationId: string;
  pinned: DocumentRef[];
  attached: string[];
  groupId: string | null;
  groupName?: string;
}) {
  const setDocuments = useSetConversationDocuments();
  const selected = useMemo(() => pinned.filter((d) => d.active).map((d) => d.id), [pinned]);
  const save = useCallback(
    (documentIds: string[]) => setDocuments.mutate({ id: conversationId, documentIds }),
    [setDocuments, conversationId],
  );
  return (
    <ScopePicker
      selected={selected}
      attached={attached}
      groupId={groupId}
      groupName={groupName}
      saving={setDocuments.isPending}
      onSave={save}
    />
  );
});
