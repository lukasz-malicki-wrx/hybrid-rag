import { LOCALES, type Locale } from "./i18n";

/**
 * Every page of the site, once. Navigation, footer, sitemap, language switch, metadata and the
 * Lighthouse URL list are all built from this, so a page cannot be in one and missing in another.
 * The slugs are the same in every language. To add a page: add it here, a `meta.<id>` entry and
 * a namespace in `messages/{en,pl}` (registered in `messages/index.ts`), `lighthouse/pages.json`,
 * and give it a route folder.
 */
export const PAGE_IDS = [
  "home",
  "features",
  "how-it-works",
  "pricing",
  "about",
  "faq",
  "privacy",
  "accessibility",
] as const;
export type PageId = (typeof PAGE_IDS)[number];

const SLUGS: Record<PageId, string> = {
  home: "",
  features: "features",
  "how-it-works": "how-it-works",
  pricing: "pricing",
  about: "about",
  faq: "faq",
  privacy: "privacy",
  accessibility: "accessibility",
};

/** An entry of the header: a link to a page, or a menu that opens a list of pages. */
type NavEntry = { kind: "page"; id: PageId } | { kind: "menu"; id: "product"; pages: readonly PageId[] };

/** The header, in order: Home, the Product menu, Pricing, About. The rest of the pages are in the footer. */
export const NAV: readonly NavEntry[] = [
  { kind: "page", id: "home" },
  { kind: "menu", id: "product", pages: ["features", "how-it-works", "faq"] },
  { kind: "page", id: "pricing" },
  { kind: "page", id: "about" },
];

/** Every page the header links to, in order. */
export const NAV_PAGE_IDS: readonly PageId[] = NAV.flatMap((entry) => (entry.kind === "page" ? [entry.id] : entry.pages));

/** The footer's "product" column. */
export const PRODUCT_PAGE_IDS = ["home", "features", "how-it-works", "pricing", "faq"] as const satisfies readonly PageId[];

/** Pages in the footer's "legal" group; the project column has the About page. */
export const LEGAL_PAGE_IDS = ["privacy", "accessibility"] as const satisfies readonly PageId[];

/** "/en", "/pl/pricing". No trailing slash. */
export function pagePath(id: PageId, locale: Locale): string {
  const slug = SLUGS[id];
  return slug ? `/${locale}/${slug}` : `/${locale}`;
}

/** The page a path belongs to, or null (a 404). Accepts a trailing slash. */
export function pageIdFromPath(pathname: string): { id: PageId; locale: Locale } | null {
  let end = pathname.length;
  while (end > 0 && pathname[end - 1] === "/") end--;
  const [, first = "", ...rest] = pathname.slice(0, end).split("/");
  const locale = LOCALES.find((l) => l === first);
  if (!locale) return null;
  const slug = rest.join("/");
  const id = PAGE_IDS.find((p) => SLUGS[p] === slug);
  return id ? { id, locale } : null;
}

/** Every (locale, page) pair, for the sitemap and the Lighthouse run. */
export function allPaths(): string[] {
  return LOCALES.flatMap((locale) => PAGE_IDS.map((id) => pagePath(id, locale)));
}
