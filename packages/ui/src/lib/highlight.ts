export type TextPart = { text: string; match: boolean };

/** Splits text into plain and matching parts; matching ignores case. An empty needle matches nothing. */
export function splitMatches(text: string, needle: string): TextPart[] {
  const wanted = needle.trim();
  if (!wanted) return [{ text, match: false }];
  const lower = text.toLowerCase();
  const target = wanted.toLowerCase();
  const parts: TextPart[] = [];
  let from = 0;
  for (let at = lower.indexOf(target); at !== -1; at = lower.indexOf(target, from)) {
    if (at > from) parts.push({ text: text.slice(from, at), match: false });
    parts.push({ text: text.slice(at, at + target.length), match: true });
    from = at + target.length;
  }
  if (from < text.length) parts.push({ text: text.slice(from), match: false });
  return parts;
}
