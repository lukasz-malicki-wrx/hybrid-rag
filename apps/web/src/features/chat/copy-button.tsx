"use client";

import { memo, useCallback } from "react";
import { Button } from "@hybrid-rag/ui/button";
import { CopyIcon } from "@hybrid-rag/ui/icons";
import { useTranslation } from "@/i18n/use-translation";
import { answerPlainText } from "@/lib/citations";
import { useCopyText } from "./use-copy";

/** Copies the answer without its [n] markers; says "Copied" for a moment, also to screen readers. */
export const CopyButton = memo(function CopyButton({ text, sourceCount }: { text: string; sourceCount: number }) {
  const { t } = useTranslation();
  const { copied, copy } = useCopyText();
  const onClick = useCallback(() => copy(answerPlainText(text, sourceCount)), [copy, text, sourceCount]);
  return (
    <>
      <Button
        variant="chip"
        size="xs"
        icon={<CopyIcon width={12} height={12} />}
        aria-label={copied ? undefined : t("chat.copyAnswer")}
        onClick={onClick}
      >
        {copied ? t("chat.copied") : t("chat.copy")}
      </Button>
      <span role="status" className="sr-only">
        {copied ? t("chat.copied") : ""}
      </span>
    </>
  );
});
