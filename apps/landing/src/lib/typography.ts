const NBSP = " ";

// A one-letter Polish word (a, i, o, u, w, z) at the start of the text or after a space, bracket or
// quote, followed by a space. Tags (<a>, </b>), {placeholders} and URLs have no space after a lone
// letter that follows a space or quote, so they never match.
const SHORT_WORD = /(?<=^|[\s(„"»])([aiouwzAIOUWZ]) /g;

const NB_HYPHEN = "\u2011";
const E_MAIL = /\b(e)-(mail\w*)/gi;

/** "e-mail" never breaks at its hyphen ("e-" at the end of a line, "mail" at the start of the next). Both languages. */
export function keepEmailTogether(text: string): string {
  return text.replace(E_MAIL, `$1${NB_HYPHEN}$2`);
}

/** Polish typography: a one-letter word is joined to the next word, so it never ends a line; and "e-mail" stays whole. */
export function polishTypography(text: string): string {
  return keepEmailTogether(text.replace(SHORT_WORD, `$1${NBSP}`));
}

type Tree = { [key: string]: Tree | string };

/** The same dictionary with `polishTypography` applied to every text (plural forms included). */
export function mapTexts(tree: Tree, transform: (text: string) => string, skip: readonly string[] = []): Tree {
  const mapValue = (key: string, value: Tree | string): Tree | string => {
    if (typeof value === "string") return transform(value);
    return skip.includes(key) ? value : mapTexts(value, transform);
  };
  return Object.fromEntries(Object.entries(tree).map(([key, value]) => [key, mapValue(key, value)]));
}
