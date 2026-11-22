"use client";

import { useChatStore } from "@/stores/chat-store";

/**
 * Whether the turn under `key` should be shown: it exists and its stored version has not
 * loaded yet. Selects a boolean, so streamed tokens do not re-render the caller.
 */
export function useLiveTurnShown(key: string | null, storedCount = 0): boolean {
  return useChatStore((s) => {
    const turn = key ? s.turns[key] : undefined;
    return !!turn && storedCount <= turn.baseCount;
  });
}
