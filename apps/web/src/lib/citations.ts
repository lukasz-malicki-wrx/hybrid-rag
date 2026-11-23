import { stripMarkdown } from "./markdown";

export type Segment = { kind: "text"; text: string } | { kind: "cite"; numbers: number[] };

const CITATION = /\[(\d+(?:\s*,\s*\d+)*)\]/g;

/**
 * Splits an answer into text and citation markers such as [1] or [2, 3]. Numbers outside
 * 1..sourceCount are not linkable and stay as plain text.
 */
export function splitCitations(text: string, sourceCount: number): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(CITATION)) {
    const numbers = match[1]
      .split(",")
      .map((n) => Number(n.trim()))
      .filter((n) => n >= 1 && n <= sourceCount);
    if (!numbers.length) continue;
    if (match.index > last) segments.push({ kind: "text", text: text.slice(last, match.index) });
    segments.push({ kind: "cite", numbers });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ kind: "text", text: text.slice(last) });
  return segments;
}

// Start of a sentence (lookbehind, so the previous match's full stop is not consumed),
// then citation markers, then the sentence up to its full stop, line end or text end.
const LEADING =
  /(?<=^|[.!?]\s+|\n\s*)((?:\[\d+(?:\s*,\s*\d+)*\]\s*)+)([^\n]*?)([.!?](?=\s|$)|(?=\n)|$)/g;

/**
 * Moves citation markers that open a sentence ("[1] Backups are tested.") to its end
 * ("Backups are tested [1]."). Small models sometimes put them first; the stored answer is
 * left as written, only the display changes.
 */
export function moveLeadingCitations(text: string): string {
  return text.replace(LEADING, (match, cites: string, body: string, end: string) =>
    body.trim() ? `${body.trimEnd()} ${cites.replace(/\s+/g, "")}${end}` : match,
  );
}

/** Citation numbers that point to a source, unique, in order of appearance. */
export function citedNumbers(text: string, sourceCount: number): number[] {
  const seen: number[] = [];
  for (const segment of splitCitations(text, sourceCount)) {
    if (segment.kind === "cite") for (const n of segment.numbers) if (!seen.includes(n)) seen.push(n);
  }
  return seen;
}

/**
 * The answer as it is shown: citation markers moved to the end of their sentence, and no space
 * between a word and the marker that follows it. The one place that decides this; the display
 * and the clipboard text both come from it.
 */
export function answerSegments(text: string, sourceCount: number): Segment[] {
  const segments = splitCitations(moveLeadingCitations(text), sourceCount);
  return segments.map((segment, i) =>
    segment.kind === "text" && segments[i + 1]?.kind === "cite" ? { ...segment, text: segment.text.trimEnd() } : segment,
  );
}

/** A citation with the text that must not be broken from it: the word before and the punctuation after. */
export type GluedSegment =
  | { kind: "text"; text: string }
  | { kind: "cite"; numbers: number[]; before: string; after: string };

/** Only the end of a long word (e.g. a URL) is kept with its marker, so the run still fits a phone. */
const END_OF_WORD = /\S{1,16}$/;

/**
 * Moves the last word before a citation marker, and the punctuation right after it, into the
 * marker's segment (`before` / `after`), so the display can keep them on one line: a superscript
 * "[1]" must never wrap alone to the start of a line. The text is the same, only split
 * differently; concatenating `before + marker + after` in place gives the original.
 */
export function glueCitations(segments: Segment[]): GluedSegment[] {
  const out: Array<Segment | GluedSegment> = segments.map((s) => ({ ...s }));
  for (let i = 0; i < out.length; i++) {
    const segment = out[i];
    if (segment.kind !== "cite") continue;
    const glued = { ...segment, before: "", after: "" };
    const prev = out[i - 1];
    if (prev?.kind === "text") {
      const tail = prev.text.match(END_OF_WORD)?.[0] ?? "";
      glued.before = tail;
      prev.text = prev.text.slice(0, prev.text.length - tail.length);
    }
    const next = segments[i + 1];
    if (next?.kind === "text") {
      // Punctuation (anything up to the next space) stays with the marker; the word after it does not.
      const head = next.text.match(/^[^\s\p{L}\p{N}]+/u)?.[0] ?? "";
      glued.after = head;
      (out[i + 1] as { text: string }).text = next.text.slice(head.length);
    }
    out[i] = glued;
  }
  return out.filter((s): s is GluedSegment => (s.kind === "cite" ? "before" in s : s.text !== ""));
}

/**
 * The answer as plain text for the clipboard: as shown, without the [n] markers that point to a
 * source and without Markdown marks (lists stay lists).
 */
export function answerPlainText(text: string, sourceCount: number): string {
  return answerSegments(stripMarkdown(text), sourceCount)
    .map((segment) => (segment.kind === "text" ? segment.text : ""))
    .join("")
    .trim();
}
