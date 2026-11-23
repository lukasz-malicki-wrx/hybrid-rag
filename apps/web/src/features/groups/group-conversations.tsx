"use client";

import { useCallback, useState } from "react";
import { Heading } from "@hybrid-rag/ui/heading";
import { Text } from "@hybrid-rag/ui/text";
import { useConversations, useUpdateConversation } from "@/api/conversations";
import type { Conversation } from "@/api/types";
import { DeleteConversationDialog } from "@/features/chat/delete-conversation-dialog";
import { useAnsweringConversationIds } from "@/hooks/use-answering-conversation";
import { useTranslation } from "@/i18n/use-translation";
import { ConversationRow } from "./conversation-row";

export function GroupConversations({ groupId }: { groupId: string }) {
  const { t } = useTranslation();
  const conversations = useConversations({ groupId });
  const update = useUpdateConversation();
  const [deleting, setDeleting] = useState<Conversation | null>(null);
  const answeringIds = useAnsweringConversationIds();

  const toggleFavourite = useCallback(
    (c: Conversation) => update.mutate({ id: c.id, favorite: !c.favorite }),
    [update],
  );
  const closeDelete = useCallback(() => setDeleting(null), []);

  return (
    <section aria-labelledby="group-conversations">
      <Heading level={2} id="group-conversations" className="mb-3">
        {t("groups.conversations")}
      </Heading>
      {conversations.data?.length ? (
        <ul className="space-y-2">
          {conversations.data.map((c) => (
            <ConversationRow
              key={c.id}
              conversation={c}
              answering={answeringIds.includes(c.id)}
              onToggleFavourite={toggleFavourite}
              onDelete={setDeleting}
            />
          ))}
        </ul>
      ) : (
        <Text tone="muted">{t("groups.noConversations")}</Text>
      )}
      <DeleteConversationDialog conversation={deleting} onClose={closeDelete} />
    </section>
  );
}
