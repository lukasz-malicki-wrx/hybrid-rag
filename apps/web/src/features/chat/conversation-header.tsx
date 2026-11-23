"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useState } from "react";
import { BarHeader } from "@hybrid-rag/ui/bar-header";
import { Heading } from "@hybrid-rag/ui/heading";
import { IconButton } from "@hybrid-rag/ui/icon-button";
import { GroupIcon, StarIcon, TrashIcon } from "@hybrid-rag/ui/icons";
import { useUpdateConversation } from "@/api/conversations";
import type { ConversationDetail, Group } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";
import { DeleteConversationDialog } from "./delete-conversation-dialog";

export const ConversationHeader = memo(function ConversationHeader({
  conversation,
  group,
}: {
  conversation: ConversationDetail;
  group?: Group;
}) {
  const { t, tp } = useTranslation();
  const router = useRouter();
  const update = useUpdateConversation();
  const [deleting, setDeleting] = useState(false);
  const { id, favorite, title, group_id } = conversation;

  const toggleFavourite = useCallback(() => update.mutate({ id, favorite: !favorite }), [update, id, favorite]);
  const afterDelete = useCallback(() => router.push(group_id ? `/g/${group_id}` : "/"), [router, group_id]);

  return (
    <BarHeader
      // Always a subtitle, so the title is at the same height as the one of the sources bar next to it.
      subtitle={
        group ? (
          <Link href={`/g/${group.id}`} className="inline-flex items-center gap-1 hover:underline">
            <GroupIcon width={14} height={14} /> {group.name}
          </Link>
        ) : (
          tp("counts.questions", conversation.messages.length)
        )
      }
      actions={
        <>
          <IconButton
            label={t(favorite ? "chat.removeFavourite" : "chat.addFavourite")}
            icon={<StarIcon filled={favorite} />}
            variant="tile"
            pressed={favorite}
            onClick={toggleFavourite}
          />
          <IconButton
            label={t("chat.deleteConversation")}
            icon={<TrashIcon />}
            variant="tile"
            tone="danger"
            onClick={() => setDeleting(true)}
          />
          <DeleteConversationDialog
            conversation={deleting ? { id, title } : null}
            onClose={() => setDeleting(false)}
            onDeleted={afterDelete}
          />
        </>
      }
    >
      <Heading level={1} size="bar" className="truncate">
        {title}
      </Heading>
    </BarHeader>
  );
});
