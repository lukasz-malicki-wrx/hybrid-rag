"use client";

import { memo, useCallback, useMemo } from "react";
import { AlertIcon } from "@hybrid-rag/ui/icons";
import type { Message as StoredMessage, Rating } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";
import { citedNumbers } from "@/lib/citations";
import { AnswerActions, AnswerActionsEnd } from "./answer-actions";
import { AnswerBody } from "./answer-body";
import { AnswerFlags } from "./answer-flags";
import { DaySeparator } from "./day-separator";
import { AnswerBubble, Message } from "./message";
import { CopyButton } from "./copy-button";
import { QuestionBubble } from "./question-bubble";
import { RatingPill } from "./rating-pill";
import { RegenerateButton } from "./regenerate-button";
import { SourcesButton } from "./sources-button";
import type { OpenSources } from "./use-sources-panel";

export const StoredTurn = memo(function StoredTurn({
  message,
  conversationId,
  day,
  onOpenSources,
  onRate,
  onRegenerate,
}: {
  message: StoredMessage;
  conversationId: string;
  /** The divider to show before this turn (it is the first of its day). */
  day?: string;
  onOpenSources: OpenSources;
  onRate: (answerId: string, rating: Rating | null) => void;
  onRegenerate: (question: string) => void;
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
    <li className="space-y-6">
      {day && <DaySeparator label={day} />}
      <Message role="user" time={message.created_at}>
        <QuestionBubble text={message.question} files={message.attachments} />
      </Message>
      <Message role="assistant" time={answer?.created_at}>
        <AnswerBubble>
          {answer ? (
            <>
              <AnswerBody text={answer.text} sources={answer.sources} onCite={cite} refused={answer.refused} />
              <AnswerFlags refused={answer.refused} uncited={answer.uncited} stopped={answer.stopped} />
              <AnswerActions>
                <RatingPill answerId={answer.id} rating={answer.rating ?? null} onRate={onRate} />
                <SourcesButton sources={answer.sources} cited={cited} onOpen={onOpenSources} />
                <AnswerActionsEnd>
                  <RegenerateButton conversationId={conversationId} question={message.question} onRegenerate={onRegenerate} />
                  {answer.text && <CopyButton text={answer.text} sourceCount={answer.sources.length} />}
                </AnswerActionsEnd>
              </AnswerActions>
            </>
          ) : (
            <>
              <p className="inline-flex items-center gap-1 text-danger">
                <AlertIcon width={16} height={16} /> {t("chat.noAnswer")}
              </p>
              <AnswerActions>
                <AnswerActionsEnd>
                  <RegenerateButton conversationId={conversationId} question={message.question} onRegenerate={onRegenerate} />
                </AnswerActionsEnd>
              </AnswerActions>
            </>
          )}
        </AnswerBubble>
      </Message>
    </li>
  );
});
