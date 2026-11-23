"use client";

import { memo, useMemo } from "react";
import type { Source } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";
import { answerSegments, glueCitations } from "@/lib/citations";
import { parseBlocks, parseInline, type InlineSpan } from "@/lib/markdown";
import { CitationButton } from "./citation-button";

type Cite = (n: number) => void;

const TAGS = { plain: "span", strong: "strong", em: "em", code: "code" } as const;

const STYLES: Record<InlineSpan["style"], string | undefined> = {
  plain: undefined,
  strong: "font-semibold",
  em: "italic",
  code: "rounded bg-surface px-1 font-mono text-[0.9em]",
};

/** One styled run of text, with its [n] markers as superscript links glued to the word before them. */
function Span({ span, sources, onCite }: { span: InlineSpan; sources: Source[]; onCite: Cite }) {
  const segments = glueCitations(answerSegments(span.text, sources.length));
  const Tag = TAGS[span.style];
  return (
    <Tag className={STYLES[span.style]}>
      {segments.map((segment, i) =>
        segment.kind === "text" ? (
          <span key={i}>{segment.text}</span>
        ) : (
          // One unbreakable run: the word before the marker, the marker(s) and the punctuation after.
          <span key={i} className="whitespace-nowrap">
            {segment.before}
            {segment.numbers.map((n) => (
              <CitationButton key={n} source={sources[n - 1]} onOpen={onCite} />
            ))}
            {segment.after}
          </span>
        ),
      )}
    </Tag>
  );
}

function Inline({ text, sources, onCite }: { text: string; sources: Source[]; onCite: Cite }) {
  return parseInline(text).map((span, i) => <Span key={i} span={span} sources={sources} onCite={onCite} />);
}

/**
 * The answer: paragraphs, lists and headings from the model's Markdown (never as HTML), with
 * citation markers as superscript links at the end of their sentence. A refusal is shown in the
 * reader's language: the model writes it in English, the sentence the API recognises.
 */
export const AnswerBody = memo(function AnswerBody({
  text,
  sources,
  onCite,
  refused,
}: {
  text: string;
  sources: Source[];
  onCite: Cite;
  refused?: boolean | null;
}) {
  const { t } = useTranslation();
  const blocks = useMemo(() => parseBlocks(text), [text]);
  if (refused) return <p>{t("answer.refusal")}</p>;
  return (
    <div className="space-y-3 break-words">
      {blocks.map((block, i) => {
        if (block.kind === "heading") {
          return (
            <p key={i} className="font-semibold">
              <Inline text={block.text} sources={sources} onCite={onCite} />
            </p>
          );
        }
        if (block.kind === "paragraph") {
          return (
            <p key={i} className="whitespace-pre-line">
              <Inline text={block.text} sources={sources} onCite={onCite} />
            </p>
          );
        }
        const List = block.ordered ? "ol" : "ul";
        return (
          <List
            key={i}
            start={block.ordered && block.start !== 1 ? block.start : undefined}
            className={`space-y-1 pl-5 ${block.ordered ? "list-decimal" : "list-disc"}`}
          >
            {block.items.map((item, j) => (
              <li key={j} className="pl-1">
                <Inline text={item} sources={sources} onCite={onCite} />
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
});
