"use client";

import { useCallback, useMemo } from "react";
import { AlertIcon } from "@hybrid-rag/ui/icons";
import { Spinner } from "@hybrid-rag/ui/spinner";
import { useScrollToEnd } from "@/hooks/use-scroll-to-end";
import { useTranslation } from "@/i18n/use-translation";
import { citedNumbers } from "@/lib/citations";
import { useChatStore } from "@/stores/chat-store";
import { AnswerActions, AnswerActionsEnd } from "./answer-actions";
import { AnswerBody } from "./answer-body";
import { AnswerFlags } from "./answer-flags";
import { DaySeparator } from "./day-separator";
import { AnswerBubble, Message } from "./message";
import { CopyButton } from "./copy-button";
import { QuestionBubble } from "./question-bubble";
import { RegenerateButton } from "./regenerate-button";
import { SourcesButton } from "./sources-button";
import type { OpenSources } from "./use-sources-panel";

function waitingKey(hasSources: boolean, queued: boolean) {
  if (!hasSources) return "chat.searching";
  if (queued) return "chat.queued";
  return "chat.writing";
}

/**
 * The question being answered under `turnKey`. The only component that reads the streaming
 * text, so each token re-renders this alone.
 */
export function LiveTurn({
  turnKey,
  onOpenSources,
  day,
  onRegenerate,
}: {
  turnKey: string;
  onOpenSources: OpenSources;
  /** The divider to show before this turn (it is the first of its day). */
  day?: string;
  /** Offered when the answer failed: asks the same question again. */
  onRegenerate?: (question: string) => void;
}) {
  const { t } = useTranslation();
  const turn = useChatStore((s) => s.turns[turnKey]);
  // On CPU the model writes one answer at a time; a second one waits without tokens.
  const queued = useChatStore((s) =>
    Object.values(s.turns).some((o) => o.key !== turnKey && o.busy && o.text.length > 0),
  );
  const endRef = useScrollToEnd([turn?.text.length, turn?.status]);
  const sources = turn?.sources;
  const cited = useMemo(() => (turn ? citedNumbers(turn.text, turn.sources.length) : []), [turn]);
  const cite = useCallback((n: number) => sources && onOpenSources(sources, cited, n), [sources, cited, onOpenSources]);
  if (!turn) return null;

  const streaming = turn.status === "connecting" || turn.status === "streaming";
  const failed = turn.status === "error";
  return (
    <li className="space-y-6">
      {day && <DaySeparator label={day} />}
      <Message role="user" time={turn.startedAt}>
        <QuestionBubble text={turn.question} files={turn.attachments} />
      </Message>
      <Message role="assistant" live>
        <AnswerBubble busy={streaming}>
          {turn.text ? (
            <AnswerBody text={turn.text} sources={turn.sources} onCite={cite} refused={turn.refused} />
          ) : (
            streaming && <Spinner label={t(waitingKey(turn.sources.length > 0, queued))} />
          )}
          {failed && (
            <p role="alert" className="mt-2 inline-flex items-center gap-1 text-danger">
              <AlertIcon width={16} height={16} /> {turn.error ?? t("errors.generic")}
            </p>
          )}
          {!streaming && !failed && (
            <AnswerFlags refused={turn.refused} uncited={turn.uncited} stopped={turn.status === "stopped"} />
          )}
          {!streaming && (
            <AnswerActions>
              <SourcesButton sources={turn.sources} cited={cited} onOpen={onOpenSources} />
              <AnswerActionsEnd>
                {failed && onRegenerate && (
                  <RegenerateButton conversationId={turn.conversationId} question={turn.question} onRegenerate={onRegenerate} />
                )}
                {!failed && turn.text && <CopyButton text={turn.text} sourceCount={turn.sources.length} />}
              </AnswerActionsEnd>
            </AnswerActions>
          )}
        </AnswerBubble>
      </Message>
      <div ref={endRef} />
    </li>
  );
}
