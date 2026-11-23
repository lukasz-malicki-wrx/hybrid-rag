/** Is `value` one of the supported `locales`? */
export function isLocaleOf<L extends string>(locales: readonly L[], value: string): value is L {
  return (locales as readonly string[]).includes(value);
}

/** First supported language in a list of BCP 47 tags (a browser's `navigator.languages`), by base tag. */
export function detectLocale<L extends string>(locales: readonly L[], fallback: L, languages: readonly string[]): L {
  for (const tag of languages) {
    const base = tag.toLowerCase().split("-")[0] ?? "";
    if (isLocaleOf(locales, base)) return base;
  }
  return fallback;
}

/**
 * The best supported language of an Accept-Language header: highest q first, ties in the order
 * written; "pl-PL" matches "pl"; q=0 means "not acceptable". Falls back to `fallback`.
 */
export function negotiateLocale<L extends string>(
  locales: readonly L[],
  fallback: L,
  acceptLanguage: string | null | undefined,
): L {
  if (!acceptLanguage) return fallback;
  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const q = qParam ? Number(qParam.slice(2)) : 1;
      return { primary: tag.trim().toLowerCase().split("-")[0] ?? "", q: Number.isFinite(q) ? q : 0, index };
    })
    .filter((entry) => entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  for (const { primary } of ranked) {
    if (isLocaleOf(locales, primary)) return primary;
  }
  return fallback;
}
