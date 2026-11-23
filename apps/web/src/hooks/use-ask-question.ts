"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { streamAnswer } from "@/api/answers";
import { ApiError } from "@/api/client";
import { queryKeys } from "@/api/query-keys";
import type { ConversationDetail } from "@/api/types";
import { newTurnKey, useChatStore, type Attachment } from "@/stores/chat-store";

export type AskOptions = {
  conversationId?: string;
  /** Key for a question that starts a new conversation (see newTurnKey). */
  key?: string;
  groupId?: string | null;
  /** Documents chosen as the conversation's search scope. */
  pinDocumentIds?: string[];
  /** Files sent with this question: shown below it and pinned to the conversation. */
  attachments?: Attachment[];
  /** Called as soon as the server names the conversation (new ones included). */
  onConversation?: (id: string, created: boolean) => void;
};

/** After Stop the server needs a moment to halt the model and store the partial answer. */
const REFRESH_AFTER_STOP_MS = [2000, 5000, 10000];

/**
 * Sends a question and streams the answer into the chat store. One answer at a time per
 * conversation; different conversations can be answered at the same time.
 */
export function useAskQuestion() {
  const client = useQueryClient();

  return useCallback(
    async (question: string, options: AskOptions = {}) => {
      let key = options.conversationId ?? options.key ?? newTurnKey();
      if (useChatStore.getState().turns[key]?.busy) return;

      const abort = new AbortController();
      let conversationId = options.conversationId ?? null;
      const cached = conversationId
        ? client.getQueryData<ConversationDetail>(queryKeys.conversation(conversationId))
        : undefined;
      const { begin, update, rekey, finish } = useChatStore.getState();
      begin(
        {
          key,
          conversationId,
          question,
          attachments: options.attachments ?? [],
          startedAt: Date.now(),
          baseCount: cached?.messages.length ?? 0,
          sources: [],
          text: "",
          status: "connecting",
        },
        abort,
      );

      const refresh = () => {
        if (conversationId) client.invalidateQueries({ queryKey: queryKeys.conversation(conversationId) });
        client.invalidateQueries({ queryKey: ["conversations"] });
        client.invalidateQueries({ queryKey: queryKeys.groups() });
      };

      try {
        const events = streamAnswer(
          {
            question,
            conversation_id: options.conversationId,
            group_id: options.conversationId ? undefined : (options.groupId ?? undefined),
            pin_document_ids: options.pinDocumentIds?.length ? options.pinDocumentIds : undefined,
            attached_document_ids: options.attachments?.length
              ? options.attachments.map((a) => a.id)
              : undefined,
          },
          abort.signal,
        );
        for await (const event of events) {
          switch (event.type) {
            case "conversation":
              conversationId = event.conversation_id;
              rekey(key, conversationId);
              key = conversationId;
              if (event.created) refresh();
              options.onConversation?.(event.conversation_id, event.created);
              break;
            case "sources":
              update(key, { sources: event.sources, status: "streaming" });
              break;
            case "token":
              update(key, (t) => ({ text: t.text + event.text, status: "streaming" }));
              break;
            case "done":
              update(key, {
                status: event.stopped ? "stopped" : "done",
                refused: event.refused,
                uncited: event.uncited,
              });
              break;
            case "error":
              update(key, { status: "error", error: event.message });
              break;
          }
        }
      } catch (error) {
        if (abort.signal.aborted) update(key, { status: "stopped" });
        else update(key, { status: "error", error: error instanceof ApiError ? error.message : undefined });
      } finally {
        finish(key);
        refresh();
        if (abort.signal.aborted) REFRESH_AFTER_STOP_MS.forEach((ms) => setTimeout(refresh, ms));
      }
    },
    [client],
  );
}
