"use client";

import { useCallback, useMemo } from "react";
import { isNotFound } from "@/api/client";
import { useRateAnswer } from "@/api/answers";
import { useConversation } from "@/api/conversations";
import { useGroups } from "@/api/groups";
import type { Message, Rating } from "@/api/types";
import { Composer } from "@/features/composer/composer";
import { Page } from "@/features/layout/page";
import { NotFoundView } from "@/features/layout/not-found-view";
import { PageLoading } from "@/features/layout/page-loading";
import { useAskQuestion } from "@/hooks/use-ask-question";
import { useScrollToEnd } from "@/hooks/use-scroll-to-end";
import { useTranslation } from "@/i18n/use-translation";
import type { When } from "@/lib/format";
import { useChatStore, type Attachment } from "@/stores/chat-store";
import { Column, ComposerColumn } from "./column";
import { ConversationHeader } from "./conversation-header";
import { ConversationScope } from "./conversation-scope";
import { LiveTurn } from "./live-turn";
import { SourcesPanel } from "./sources-panel";
import { StoredTurn } from "./stored-turn";
import { TurnAnnouncer } from "./turn-announcer";
import { dayDividers } from "./turns";
import { useLiveTurnShown } from "./use-live-turn-shown";
import { useSourcesPanel } from "./use-sources-panel";

const NO_MESSAGES: Message[] = [];

export function ConversationView({ id }: { id: string }) {
  const { t, dayLabel } = useTranslation();
  const conversation = useConversation(id);
  const groups = useGroups();
  const ask = useAskQuestion();
  const panel = useSourcesPanel();

  const data = conversation.data;
  const stored = data?.messages ?? NO_MESSAGES;
  const liveShown = useLiveTurnShown(id, stored.length);
  const endRef = useScrollToEnd([stored.length, liveShown]);
  const { mutate: rate } = useRateAnswer(id);
  // When the live question was sent: it gets a divider if the last stored message is of an earlier day.
  const startedAt = useChatStore((s) => s.turns[id]?.startedAt);
  const group = groups.data?.find((g) => g.id === data?.group_id);

  const send = useCallback(
    (question: string, attachments: Attachment[]) => ask(question, { conversationId: id, attachments }),
    [ask, id],
  );
  const regenerate = useCallback((question: string) => send(question, []), [send]);
  const onRate = useCallback(
    (answerId: string, rating: Rating | null) => rate({ answerId, rating }),
    [rate],
  );
  const days = useMemo(() => {
    const times: When[] = stored.map((m) => m.created_at);
    if (liveShown && startedAt !== undefined) times.push(startedAt);
    const labels = dayDividers(times, dayLabel);
    return { stored: labels.slice(0, stored.length), live: labels[stored.length] };
  }, [stored, liveShown, startedAt, dayLabel]);
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
    <Page
      header={<ConversationHeader conversation={data} group={group} />}
      footer={
        <ComposerColumn>
          <Composer
            turnKey={id}
            groupId={data.group_id}
            placeholder={t("composer.followUpPlaceholder")}
            onSend={send}
            scope={scope}
          />
        </ComposerColumn>
      }
      aside={panel.selection && <SourcesPanel selection={panel.selection} onClose={panel.close} />}
    >
      <Column as="ol" aria-label={t("chat.messages")} className="space-y-8 py-6">
        {stored.map((message, i) => (
          <StoredTurn
            key={message.query_id}
            message={message}
            conversationId={id}
            day={days.stored[i]}
            onOpenSources={panel.open}
            onRate={onRate}
            onRegenerate={regenerate}
          />
        ))}
        {liveShown && <LiveTurn turnKey={id} day={days.live} onOpenSources={panel.open} onRegenerate={regenerate} />}
      </Column>
      <div ref={endRef} />
      <TurnAnnouncer turnKey={id} active={liveShown} />
    </Page>
  );
}
