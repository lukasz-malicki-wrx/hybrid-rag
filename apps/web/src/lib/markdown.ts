/**
 * The little Markdown that models write in answers: paragraphs, bullet and numbered lists,
 * headings, bold, italic and inline code. It is parsed into plain data and rendered as React
 * elements, so nothing in an answer is ever interpreted as HTML. Anything else stays text.
 */

export type Block =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "list"; ordered: boolean; start: number; items: string[] };

type ListBlock = Extract<Block, { kind: "list" }>;

const BULLET = /^\s*[-*•+]\s+(.*)$/;
const NUMBER = /^\s*(\d{1,3})[.)]\s+(.*)$/;
const HEADING = /^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/;
const CONTINUATION = /^\s{2,}\S/;

/**
 * Splits an answer into blocks. A blank line ends a paragraph but not a list, because models
 * often put an empty line between numbered points; an indented line continues the last item.
 */
export function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  // In an object: the helper below changes it, and TypeScript does not follow that into the loop.
  const open: { list: ListBlock | null } = { list: null };

  const endParagraph = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", text: paragraph.join("\n") });
    paragraph = [];
  };
  const addItem = (ordered: boolean, start: number, item: string) => {
    endParagraph();
    if (!open.list || open.list.ordered !== ordered) {
      open.list = { kind: "list", ordered, start, items: [] };
      blocks.push(open.list);
    }
    open.list.items.push(item);
  };

  for (const line of text.split(/\r?\n/)) {
    const bullet = BULLET.exec(line);
    const number = NUMBER.exec(line);
    const heading = HEADING.exec(line);
    if (bullet) addItem(false, 1, bullet[1]);
    else if (number) addItem(true, Number(number[1]), number[2]);
    else if (!line.trim()) endParagraph();
    else if (open.list && CONTINUATION.test(line) && !paragraph.length) {
      open.list.items[open.list.items.length - 1] += ` ${line.trim()}`;
    } else if (heading) {
      endParagraph();
      open.list = null;
      blocks.push({ kind: "heading", text: heading[1] });
    } else {
      open.list = null;
      paragraph.push(line);
    }
  }
  endParagraph();
  return blocks;
}

export type InlineStyle = "plain" | "strong" | "em" | "code";
export type InlineSpan = { style: InlineStyle; text: string };

// **bold**, __bold__, `code`, *italic* (a single star that does not touch a space on the inside).
const INLINE = /(\*\*|__)(?=\S)(.+?)(?<=\S)\1|`([^`\n]+)`|(?<![\w*])\*(?=\S)([^*\n]+?)(?<=\S)\*(?![\w*])/g;

/** Splits a line of text into plain, bold, italic and code spans. Unpaired marks stay text. */
export function parseInline(text: string): InlineSpan[] {
  const spans: InlineSpan[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    if (match.index > last) spans.push({ style: "plain", text: text.slice(last, match.index) });
    if (match[2] !== undefined) spans.push({ style: "strong", text: match[2] });
    else if (match[3] !== undefined) spans.push({ style: "code", text: match[3] });
    else spans.push({ style: "em", text: match[4] ?? "" });
    last = match.index + match[0].length;
  }
  if (last < text.length) spans.push({ style: "plain", text: text.slice(last) });
  return spans;
}

/** The text without Markdown marks, for the clipboard. */
export function stripMarkdown(text: string): string {
  return parseBlocks(text)
    .map((block) => {
      const plain = (line: string) => parseInline(line).map((span) => span.text).join("");
      if (block.kind !== "list") return plain(block.text);
      return block.items.map((item, i) => `${block.ordered ? `${block.start + i}.` : "-"} ${plain(item)}`).join("\n");
    })
    .join("\n\n");
}
