"use client";

import { memo, type ReactNode } from "react";
import type { Conversation } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";

/**
 * What a conversation looks like in a list: the title and the time on one line (with `lead`, a
 * small icon, before them), then the start of the latest answer. The card in the sidebar and the
 * row in a group are this, with their own frame around it.
 */
export const ConversationSummary = memo(function ConversationSummary({
  conversation,
  lead,
  emptyPreview,
}: {
  conversation: Pick<Conversation, "title" | "preview" | "updated_at">;
  lead?: ReactNode;
  /** Shown instead of a missing preview; without it the line is left out. */
  emptyPreview?: string;
}) {
  const { shortTime } = useTranslation();
  const { title, preview, updated_at } = conversation;
  const text = preview ?? emptyPreview;
  return (
    <span className="flex min-w-0 flex-col gap-1">
      <span className="flex items-center gap-2">
        {lead}
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">{title}</span>
        <time dateTime={updated_at} className="shrink-0 text-xs text-muted">
          {shortTime(updated_at)}
        </time>
      </span>
      {text && <span className="line-clamp-2 text-xs/[18px] text-muted">{text}</span>}
    </span>
  );
});
