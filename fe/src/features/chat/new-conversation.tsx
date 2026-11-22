"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Composer } from "@/features/composer/composer";
import { ScopePicker } from "@/features/scope/scope-picker";
import { useAskQuestion } from "@/hooks/use-ask-question";
import { useTranslation } from "@/i18n/use-translation";
import { newTurnKey, type Attachment } from "@/stores/chat-store";
import { LiveTurn } from "./live-turn";
import { SourcesPanel } from "./sources-panel";
import { TurnAnnouncer } from "./turn-announcer";
import { useLiveTurnShown } from "./use-live-turn-shown";
import { useSourcesPanel } from "./use-sources-panel";

/**
 * Start screen of a conversation: a large message box. Once the server creates the
 * conversation the page moves to /c/{id}, where the answer keeps streaming.
 */
export function NewConversation({ groupId, groupName }: { groupId?: string; groupName?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const ask = useAskQuestion();
  const panel = useSourcesPanel();
  // Documents picked before the conversation exists; pinned to it with the first question.
  const [selected, setSelected] = useState<string[]>([]);
  // Key of the question sent from here; shown until the server creates the conversation (or
  // here for good if that fails), then the page moves to /c/{id}.
  const [turnKey, setTurnKey] = useState<string | null>(null);
  const pendingShown = useLiveTurnShown(turnKey);

  const send = useCallback(
    (question: string, attachments: Attachment[]) => {
      const key = newTurnKey();
      setTurnKey(key);
      setSelected([]);
      ask(question, {
        key,
        groupId,
        pinDocumentIds: selected,
        attachments,
        onConversation: (id, created) => created && router.push(`/c/${id}`),
      });
    },
    [ask, groupId, router, selected],
  );
  const scope = useCallback(
    (attached: string[]) => (
      <ScopePicker
        selected={selected}
        attached={attached}
        groupId={groupId}
        groupName={groupName}
        onSave={setSelected}
      />
    ),
    [selected, groupId, groupName],
  );

  return (
    <div className="flex h-full">
      <div className="relative min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-4 py-10">
          <Heading level={groupName ? 2 : 1} size="xl" className="text-center">
            {groupName ? t("chat.groupHeading", { name: groupName }) : t("chat.newHeading")}
          </Heading>
          {!groupName && (
            <Text tone="muted" className="mx-auto mt-2 max-w-xl text-center">
              {t("chat.newIntro")}
            </Text>
          )}
          <div className="mt-8">
            <Composer autoFocus turnKey={turnKey} groupId={groupId} onSend={send} scope={scope} />
          </div>
          {pendingShown && turnKey && (
            <ol aria-label={t("chat.messages")} className="mt-8">
              <LiveTurn turnKey={turnKey} onOpenSources={panel.open} />
            </ol>
          )}
          <TurnAnnouncer turnKey={turnKey} active={pendingShown} />
        </div>
      </div>
      {panel.selection && <SourcesPanel selection={panel.selection} onClose={panel.close} />}
    </div>
  );
}
