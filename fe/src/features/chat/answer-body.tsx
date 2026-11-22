"use client";

import { memo, useMemo } from "react";
import type { Source } from "@/api/types";
import { moveLeadingCitations, splitCitations } from "@/lib/citations";
import { CitationButton } from "./citation-button";

/** Answer text with its [n] markers shown as superscript links at the end of their sentence. */
export const AnswerBody = memo(function AnswerBody({
  text,
  sources,
  onCite,
}: {
  text: string;
  sources: Source[];
  onCite: (n: number) => void;
}) {
  const segments = useMemo(() => splitCitations(moveLeadingCitations(text), sources.length), [text, sources.length]);
  return (
    <p className="whitespace-pre-wrap break-words leading-relaxed">
      {segments.map((segment, i) =>
        segment.kind === "text" ? (
          // No space between a word and the superscript that follows it.
          <span key={i}>{segments[i + 1]?.kind === "cite" ? segment.text.trimEnd() : segment.text}</span>
        ) : (
          segment.numbers.map((n) => <CitationButton key={`${i}-${n}`} source={sources[n - 1]} onOpen={onCite} />)
        ),
      )}
    </p>
  );
});
