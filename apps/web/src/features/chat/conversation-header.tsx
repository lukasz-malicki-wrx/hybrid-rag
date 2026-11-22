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
  const { t } = useTranslation();
  const router = useRouter();
  const update = useUpdateConversation();
  const [deleting, setDeleting] = useState(false);
  const { id, favorite, title, group_id } = conversation;

  const toggleFavourite = useCallback(() => update.mutate({ id, favorite: !favorite }), [update, id, favorite]);
  const afterDelete = useCallback(() => router.push(group_id ? `/g/${group_id}` : "/"), [router, group_id]);

  return (
    <BarHeader
      subtitle={
        group && (
          <Link href={`/g/${group.id}`} className="inline-flex items-center gap-1 hover:underline">
            <GroupIcon width={14} height={14} /> {group.name}
          </Link>
        )
      }
      actions={
        <>
          <IconButton
            label={t(favorite ? "chat.removeFavourite" : "chat.addFavourite")}
            icon={<StarIcon filled={favorite} />}
            pressed={favorite}
            onClick={toggleFavourite}
          />
          <IconButton label={t("chat.deleteConversation")} icon={<TrashIcon />} tone="danger" onClick={() => setDeleting(true)} />
          <DeleteConversationDialog
            conversation={deleting ? { id, title } : null}
            onClose={() => setDeleting(false)}
            onDeleted={afterDelete}
          />
        </>
      }
    >
      <Heading level={1} size="sm" className="truncate">
        {title}
      </Heading>
    </BarHeader>
  );
});
