"use client";

import { useCallback } from "react";
import { isNotFound } from "@/api/client";
import { useConversation } from "@/api/conversations";
import { useGroups } from "@/api/groups";
import type { Message } from "@/api/types";
import { Composer } from "@/features/composer/composer";
import { NotFoundView } from "@/features/layout/not-found-view";
import { PageLoading } from "@/features/layout/page-loading";
import { useAskQuestion } from "@/hooks/use-ask-question";
import { useScrollToEnd } from "@/hooks/use-scroll-to-end";
import { useTranslation } from "@/i18n/use-translation";
import type { Attachment } from "@/stores/chat-store";
import { ConversationHeader } from "./conversation-header";
import { ConversationScope } from "./conversation-scope";
import { LiveTurn } from "./live-turn";
import { SourcesPanel } from "./sources-panel";
import { StoredTurn } from "./stored-turn";
import { TurnAnnouncer } from "./turn-announcer";
import { useLiveTurnShown } from "./use-live-turn-shown";
import { useSourcesPanel } from "./use-sources-panel";

const NO_MESSAGES: Message[] = [];

export function ConversationView({ id }: { id: string }) {
  const { t } = useTranslation();
  const conversation = useConversation(id);
  const groups = useGroups();
  const ask = useAskQuestion();
  const panel = useSourcesPanel();

  const data = conversation.data;
  const stored = data?.messages ?? NO_MESSAGES;
  const liveShown = useLiveTurnShown(id, stored.length);
  const endRef = useScrollToEnd([stored.length, liveShown]);
  const group = groups.data?.find((g) => g.id === data?.group_id);

  const send = useCallback(
    (question: string, attachments: Attachment[]) => ask(question, { conversationId: id, attachments }),
    [ask, id],
  );
  const scope = useCallback(
    (attached: string[]) =>
      data && (
        <ConversationScope
          conversationId={id}
          pinned={data.documents}
          attached={attached}
          groupId={data.group_id}
          groupName={group?.name}
        />
      ),
    [data, id, group?.name],
  );

  if (conversation.isPending) return <PageLoading label="chat.loading" />;
  if (!data) {
    return isNotFound(conversation.error) ? (
      <NotFoundView title="chat.notFound" hint="chat.notFoundHint" />
    ) : (
      <NotFoundView title="chat.loadError" hint="chat.loadErrorHint" />
    );
  }

  return (
    <div className="flex h-full">
      {/* `relative`: hidden (sr-only) text stays inside this scroll area instead of stretching the page. */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-y-auto">
        <ConversationHeader conversation={data} group={group} />

        <ol aria-label={t("chat.messages")} className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 pb-6 pt-24">
          {stored.map((message) => (
            <StoredTurn key={message.query_id} message={message} onOpenSources={panel.open} />
          ))}
          {liveShown && <LiveTurn turnKey={id} onOpenSources={panel.open} />}
        </ol>
        <div ref={endRef} />
        <TurnAnnouncer turnKey={id} active={liveShown} />

        <div className="sticky bottom-0 mx-auto w-full max-w-3xl bg-bg px-4 pb-4 pt-2">
          <Composer
            turnKey={id}
            groupId={data.group_id}
            placeholder={t("composer.followUpPlaceholder")}
            onSend={send}
            scope={scope}
          />
        </div>
      </div>

      {panel.selection && <SourcesPanel selection={panel.selection} onClose={panel.close} />}
    </div>
  );
}
