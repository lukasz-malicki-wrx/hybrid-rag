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
