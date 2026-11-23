"use client";

import { memo, useCallback } from "react";
import { Button } from "@hybrid-rag/ui/button";
import { RefreshIcon } from "@hybrid-rag/ui/icons";
import { useTranslation } from "@/i18n/use-translation";
import { useChatStore } from "@/stores/chat-store";

/** Asks the question again as a new turn; waits while its conversation is being answered. */
export const RegenerateButton = memo(function RegenerateButton({
  conversationId,
  question,
  onRegenerate,
}: {
  conversationId?: string | null;
  question: string;
  onRegenerate: (question: string) => void;
}) {
  const { t } = useTranslation();
  const busy = useChatStore((s) => (conversationId ? !!s.turns[conversationId]?.busy : false));
  const regenerate = useCallback(() => onRegenerate(question), [onRegenerate, question]);
  return (
    <Button
      variant="chip"
      size="xs"
      icon={<RefreshIcon width={12} height={12} />}
      aria-label={t("chat.regenerateAnswer")}
      disabled={busy}
      onClick={regenerate}
    >
      {t("chat.regenerate")}
    </Button>
  );
});
