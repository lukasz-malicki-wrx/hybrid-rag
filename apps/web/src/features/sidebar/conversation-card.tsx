"use client";

import Link from "next/link";
import { memo } from "react";
import { cn } from "@hybrid-rag/ui/cn";
import { ChatIcon, StarIcon } from "@hybrid-rag/ui/icons";
import type { Conversation } from "@/api/types";
import { AnsweringIndicator } from "@/features/chat/answering-indicator";
import { ConversationSummary } from "@/features/chat/conversation-summary";
import { useTranslation } from "@/i18n/use-translation";

function CardIcon({ favorite }: { favorite: boolean }) {
  return favorite ? <StarIcon filled width={12} height={12} className="text-accent" /> : <ChatIcon width={12} height={12} />;
}

/** A two-line card: title and time, then the start of the latest answer. */
export const ConversationCard = memo(function ConversationCard({
  conversation,
  active,
  answering,
}: {
  conversation: Conversation;
  active: boolean;
  /** The assistant is answering in this conversation right now. */
  answering: boolean;
}) {
  const { t } = useTranslation();
  const { id, favorite } = conversation;
  const lead = (
    <span className="shrink-0 text-muted">{answering ? <AnsweringIndicator /> : <CardIcon favorite={favorite} />}</span>
  );
  return (
    <Link
      href={`/c/${id}`}
      aria-current={active ? "page" : undefined}
      aria-busy={answering || undefined}
      className={cn(
        "flex min-h-[5.5rem] flex-col rounded-lg px-4 py-3 hover:bg-surface-2",
        active && "bg-surface-2",
        answering && "ai-active",
      )}
    >
      <ConversationSummary conversation={conversation} lead={lead} emptyPreview={t("sidebar.noPreview")} />
    </Link>
  );
});
