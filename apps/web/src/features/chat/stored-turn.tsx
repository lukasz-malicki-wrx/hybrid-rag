"use client";

import { memo, useCallback, useMemo } from "react";
import { AlertIcon } from "@hybrid-rag/ui/icons";
import type { Message } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";
import { citedNumbers } from "@/lib/citations";
import { AnswerBody } from "./answer-body";
import { AnswerFlags } from "./answer-flags";
import { QuestionBubble } from "./question-bubble";
import { SourcesButton } from "./sources-button";
import type { OpenSources } from "./use-sources-panel";

export const StoredTurn = memo(function StoredTurn({
  message,
  onOpenSources,
}: {
  message: Message;
  onOpenSources: OpenSources;
}) {
  const { t } = useTranslation();
  const answer = message.answer;
  const sources = answer?.sources;
  const cited = useMemo(
    () => (answer ? citedNumbers(answer.text, answer.sources.length) : []),
    [answer],
  );
  const cite = useCallback((n: number) => sources && onOpenSources(sources, cited, n), [sources, cited, onOpenSources]);

  return (
    <li className="space-y-3">
      <QuestionBubble text={message.question} files={message.attachments} />
      <div>
        <span className="sr-only">{t("chat.assistant")} </span>
        {answer ? (
          <>
            <AnswerBody text={answer.text} sources={answer.sources} onCite={cite} />
            <AnswerFlags refused={answer.refused} uncited={answer.uncited} stopped={answer.stopped} />
            <SourcesButton sources={answer.sources} cited={cited} onOpen={onOpenSources} />
          </>
        ) : (
          <p className="inline-flex items-center gap-1 text-sm text-danger">
            <AlertIcon width={16} height={16} /> {t("chat.noAnswer")}
          </p>
        )}
      </div>
    </li>
  );
});
