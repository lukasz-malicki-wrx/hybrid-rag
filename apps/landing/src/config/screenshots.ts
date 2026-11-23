/**
 * The screenshots of the app shown on the site. One entry per picture, in one place.
 *
 * The files are made by `npm run screenshots` in apps/web (demo data, light and dark, twice the
 * listed size, WebP into public/screenshots/). `src: null` shows a placeholder with the same
 * proportions instead (no layout shift when the real image arrives).
 * The description of the picture is the translation `screenshots.<id>`.
 * See apps/landing/README.md.
 */
export const SCREENSHOT_IDS = [
  "hero-chat",
  "about-sources",
  "how-flow",
  "chat",
  "sources",
  "start",
  "groups",
  "document",
  "search-lab",
  "mobile-chat",
  "settings",
] as const;
export type ScreenshotId = (typeof SCREENSHOT_IDS)[number];

type ScreenshotEntry = {
  /** Pixel size of the image file: sets the aspect ratio. */
  width: number;
  height: number;
  /** Paths below /public, e.g. "/screenshots/chat-light.png". `null` until the screenshot exists. */
  src: { light: string; dark: string } | null;
};

const DESKTOP = { width: 1440, height: 900 } as const;
const MOBILE = { width: 390, height: 844 } as const;
/** The pictures at the top of pages, nearly square (540x478 and 540x453 at the design width), at twice the size. */
const HOME_HERO = { width: 1080, height: 956 } as const;
const HOME_ABOUT = { width: 1080, height: 906 } as const;

/** The light and dark files of a screenshot made by `npm run screenshots` in apps/web. */
const themed = (id: ScreenshotId) => ({ light: `/screenshots/${id}-light.webp`, dark: `/screenshots/${id}-dark.webp` });

export const SCREENSHOTS: Record<ScreenshotId, ScreenshotEntry> = {
  "hero-chat": { ...HOME_HERO, src: themed("hero-chat") },
  "about-sources": { ...HOME_ABOUT, src: themed("about-sources") },
  "how-flow": { ...HOME_HERO, src: themed("how-flow") },
  chat: { ...DESKTOP, src: themed("chat") },
  sources: { ...DESKTOP, src: themed("sources") },
  start: { ...DESKTOP, src: themed("start") },
  groups: { ...DESKTOP, src: themed("groups") },
  document: { ...DESKTOP, src: themed("document") },
  "search-lab": { ...DESKTOP, src: themed("search-lab") },
  "mobile-chat": { ...MOBILE, src: themed("mobile-chat") },
  settings: { ...DESKTOP, src: themed("settings") },
};
