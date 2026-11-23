"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import type { ComposerHandle } from "@/features/composer/composer";
import { ScopePicker } from "@/features/scope/scope-picker";
import { useAskQuestion } from "@/hooks/use-ask-question";
import { newTurnKey, type Attachment } from "@/stores/chat-store";
import { SourcesPanel } from "./sources-panel";
import { useLiveTurnShown } from "./use-live-turn-shown";
import { useSourcesPanel } from "./use-sources-panel";

/**
 * What the start of a conversation needs, however it is laid out (the start screen, or a group
 * page): sending the first question, the pending answer until the server creates the
 * conversation, the scope chosen before it exists, and the sources panel.
 */
export function useNewConversation({ groupId, groupName }: { groupId?: string; groupName?: string }) {
  const router = useRouter();
  const ask = useAskQuestion();
  const panel = useSourcesPanel();
  // Documents picked before the conversation exists; pinned to it with the first question.
  const [selected, setSelected] = useState<string[]>([]);
  // Key of the question sent from here; shown until the server creates the conversation (or
  // here for good if that fails), then the page moves to /c/{id}.
  const [turnKey, setTurnKey] = useState<string | null>(null);
  const pendingShown = useLiveTurnShown(turnKey);
  const composer = useRef<ComposerHandle>(null);
  const putInComposer = useCallback((text: string) => composer.current?.setText(text), []);

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

  return {
    /** Props for the Composer. */
    composer: { ref: composer, autoFocus: true, turnKey, groupId, onSend: send, scope },
    /** The key of the pending answer, and whether it is to be shown. */
    pending: { turnKey, shown: pendingShown },
    /** Fills the message box with a text (it is not sent). */
    putInComposer,
    openSources: panel.open,
    /** The sources panel, when one is open. */
    aside: panel.selection && <SourcesPanel selection={panel.selection} onClose={panel.close} />,
  };
}
