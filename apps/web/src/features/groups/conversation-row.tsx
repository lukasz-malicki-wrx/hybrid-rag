"use client";

import Link from "next/link";
import { memo } from "react";
import { cn } from "@hybrid-rag/ui/cn";
import { IconButton } from "@hybrid-rag/ui/icon-button";
import { ChatIcon, StarIcon, TrashIcon } from "@hybrid-rag/ui/icons";
import type { Conversation } from "@/api/types";
import { AnsweringIndicator } from "@/features/chat/answering-indicator";
import { ConversationSummary } from "@/features/chat/conversation-summary";
import { useTranslation } from "@/i18n/use-translation";

export const ConversationRow = memo(function ConversationRow({
  conversation,
  onToggleFavourite,
  onDelete,
  answering,
}: {
  conversation: Conversation;
  /** The assistant is answering in this conversation right now. */
  answering?: boolean;
  onToggleFavourite: (conversation: Conversation) => void;
  onDelete: (conversation: Conversation) => void;
}) {
  const { t } = useTranslation();
  const { title, favorite } = conversation;
  return (
    <li className={cn("flex items-start gap-2 rounded-lg bg-bubble-user px-3 py-2", answering && "ai-active")}>
      <span className="mt-2 shrink-0 text-muted">{answering ? <AnsweringIndicator /> : <ChatIcon width={14} height={14} />}</span>
      <Link href={`/c/${conversation.id}`} aria-busy={answering || undefined} className="flex min-w-0 flex-1 flex-col rounded py-1 hover:underline">
        <ConversationSummary conversation={conversation} />
      </Link>
      <IconButton
        label={t(favorite ? "groups.removeFavourite" : "groups.addFavourite", { title })}
        icon={<StarIcon filled={favorite} />}
        pressed={favorite}
        onClick={() => onToggleFavourite(conversation)}
      />
      <IconButton
        label={t("groups.deleteConversation", { title })}
        icon={<TrashIcon />}
        tone="danger"
        onClick={() => onDelete(conversation)}
      />
    </li>
  );
});
