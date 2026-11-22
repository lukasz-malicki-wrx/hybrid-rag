"use client";

import { memo } from "react";
import { Button } from "@hybrid-rag/ui/button";
import { SendIcon, StopIcon } from "@hybrid-rag/ui/icons";
import { useTranslation } from "@/i18n/use-translation";

/** Send, or Stop while an answer is being written. */
export const ComposerActions = memo(function ComposerActions({
  busy,
  canSend,
  onSend,
  onStop,
}: {
  busy: boolean;
  canSend: boolean;
  onSend: () => void;
  onStop: () => void;
}) {
  const { t } = useTranslation();
  if (busy)
    return (
      <Button size="sm" onClick={onStop} icon={<StopIcon />}>
        {t("composer.stop")}
      </Button>
    );
  return (
    <Button
      variant="primary"
      size="sm"
      onClick={onSend}
      disabled={!canSend}
      aria-label={t("composer.send")}
      className="min-w-10 px-3 disabled:opacity-40"
    >
      <SendIcon />
    </Button>
  );
});
