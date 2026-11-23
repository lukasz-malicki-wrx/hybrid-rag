"use client";

import { memo } from "react";
import { Button } from "@hybrid-rag/ui/button";
import { SendIcon, StopIcon } from "@hybrid-rag/ui/icons";
import { useTranslation } from "@/i18n/use-translation";

/** Send (an icon, like the one in the design), or Stop while an answer is being written. */
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
      <Button variant="chip" size="sm" icon={<StopIcon />} onClick={onStop} className="ml-auto">
        {t("composer.stop")}
      </Button>
    );
  return (
    <Button
      variant="primary"
      size="icon"
      icon={<SendIcon />}
      aria-label={t("composer.send")}
      onClick={onSend}
      disabled={!canSend}
      className="ml-auto"
    />
  );
});
