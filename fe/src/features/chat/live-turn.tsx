"use client";

import { useCallback, useMemo } from "react";
import { AlertIcon } from "@/components/icons";
import { Spinner } from "@/components/ui/spinner";
import { useScrollToEnd } from "@/hooks/use-scroll-to-end";
import { useTranslation } from "@/i18n/use-translation";
import { citedNumbers } from "@/lib/citations";
import { useChatStore } from "@/stores/chat-store";
import { AnswerBody } from "./answer-body";
import { AnswerFlags } from "./answer-flags";
import { QuestionBubble } from "./question-bubble";
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
export function LiveTurn({ turnKey, onOpenSources }: { turnKey: string; onOpenSources: OpenSources }) {
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
  return (
    <li className="space-y-3">
      <QuestionBubble text={turn.question} files={turn.attachments} />
      <div aria-busy={streaming}>
        <span className="sr-only">{t("chat.assistant")} </span>
        {turn.text ? (
          <AnswerBody text={turn.text} sources={turn.sources} onCite={cite} />
        ) : (
          streaming && <Spinner label={t(waitingKey(turn.sources.length > 0, queued))} />
        )}
        {turn.status === "error" && (
          <p role="alert" className="mt-2 inline-flex items-center gap-1 text-sm text-danger">
            <AlertIcon width={16} height={16} /> {turn.error ?? t("errors.generic")}
          </p>
        )}
        {!streaming && turn.status !== "error" && (
          <AnswerFlags refused={turn.refused} uncited={turn.uncited} stopped={turn.status === "stopped"} />
        )}
        {!streaming && <SourcesButton sources={turn.sources} cited={cited} onOpen={onOpenSources} />}
      </div>
      <div ref={endRef} />
    </li>
  );
}
