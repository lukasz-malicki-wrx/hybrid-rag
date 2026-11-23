/** Lower case without diacritics, so "zolw" finds "Żółw" (ł has no decomposition, hence the extra step). */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase()
    .replaceAll("ł", "l")
    .trim();
}

/** Items whose text contains the query (case- and diacritic-insensitive); all of them for a blank query. */
export function filterByText<T>(items: readonly T[], query: string, text: (item: T) => string): readonly T[] {
  const needle = normalizeText(query);
  if (!needle) return items;
  return items.filter((item) => normalizeText(text(item)).includes(needle));
}

export type EmptyReason = "no-match" | "error" | "empty";

/**
 * Why a list shows no items (`null` when it shows some, or has not loaded yet). `loaded` is the
 * number of items before filtering, `undefined` while there is no data. A filter that excludes
 * everything wins over an error, which wins over an empty list.
 */
export function emptyReason({
  shown,
  loaded,
  isError,
  query,
}: {
  shown: number;
  loaded: number | undefined;
  isError: boolean;
  query: string;
}): EmptyReason | null {
  if (shown > 0) return null;
  if (query.trim() && loaded) return "no-match";
  if (isError) return "error";
  return loaded !== undefined ? "empty" : null;
}
