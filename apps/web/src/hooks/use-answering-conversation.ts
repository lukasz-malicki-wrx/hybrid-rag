"use client";

import { useShallow } from "zustand/react/shallow";
import { useChatStore } from "@/stores/chat-store";

/** Ids of the conversations the assistant is answering right now. */
export function useAnsweringConversationIds(): string[] {
  return useChatStore(
    useShallow((s) =>
      Object.values(s.turns)
        .filter((t) => t.busy && t.conversationId)
        .map((t) => t.conversationId as string),
    ),
  );
}
