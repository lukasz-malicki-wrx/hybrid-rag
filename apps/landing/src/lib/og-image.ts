import { LOCALES, isLocale, type Locale } from "./i18n";
import { PAGE_IDS, type PageId } from "./routes";

/** The Open Graph image of every page and language is a route at /opengraph-image/<language>/<page>. */
export const OG_ROUTE = "/opengraph-image";

/** The size social networks expect for a large preview card. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/** "/opengraph-image/pl/how-it-works". The proxy leaves this path alone (see its matcher). */
export function ogImagePath(id: PageId, locale: Locale): string {
  return `${OG_ROUTE}/${locale}/${id}`;
}

/** Every (language, page) pair that has an image: what the route is built for. */
export function ogImageParams(): { locale: Locale; page: PageId }[] {
  return LOCALES.flatMap((locale) => PAGE_IDS.map((page) => ({ locale, page })));
}

/** The page and language of a request to the image route, or null for anything else. */
export function parseOgParams(locale: string, page: string): { locale: Locale; id: PageId } | null {
  const id = PAGE_IDS.find((p) => p === page);
  return isLocale(locale) && id ? { locale, id } : null;
}

/**
 * The size of the title in pixels: shorter titles are set larger so that every card fills about
 * the same space, and the longest ones still fit in three lines.
 */
export function ogTitleSize(title: string): number {
  if (title.length <= 24) return 96;
  if (title.length <= 48) return 76;
  return 64;
}
