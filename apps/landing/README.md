# @hybrid-rag/landing

The website of hybrid-rag: Next.js 16, English and Polish (`/en`, `/pl`), no cookies, no analytics,
no third-party requests. The plan is in `docs/LANDING_PLAN.md`; the layout follows `docs/LANDING_REDESIGN_PLAN.md`.

## Commands

Run from the repository root (`-w @hybrid-rag/landing`) or from this folder.

| Command | What it does |
|---|---|
| `npm run dev` | dev server on http://localhost:3200 (the port is in `ports.json`; `LANDING_PORT` overrides it. The checks that start their own server use the next two ports of that file) |
| `npm run build` / `npm run start` | production build and server (port 3200) |
| `npm run lint` / `typecheck` / `test` | ESLint (strict, literal text in JSX is an error), tsc, vitest |
| `npm run test:e2e` | Playwright on its own port (3203, `LANDING_E2E_PORT` overrides it), so a running `npm run dev` is never tested by mistake: redirect, language switch, theme, menu, skip link, axe (WCAG 2.2 AA + best practices, light and dark, 320 and 1280 px), headers |
| `npm run validate:html` | html-validate (pinned 11.19.0) on every page in both languages; run after `npm run build` |
| `npm run lighthouse` | Lighthouse CI on `next start`, every page in both languages, mobile and desktop, median of 3, all four scores must be at least 90. Needs `npm run build` first. `-- mobile` or `-- desktop` for one; `LIGHTHOUSE_URL=/en,/pl/faq` for chosen pages; `LIGHTHOUSE_RUNS=1`. Prints every audit that is not a clean pass, informational ones included. Chrome: `CHROME_PATH`, else Playwright's Chromium (`npx playwright install chromium`) |

## Layout

```
src/app/[locale]/<page>/page.tsx   route: metadata + data + composition of sections
src/sections/<page>/               section components of that page
src/messages/{en,pl}/<ns>.json     ALL texts (see "Translations")
src/config/                        data without text: site.ts (URLs), screenshots.ts (sizes, files)
src/components/ui/                 primitives: Container, Section (plain / panel), PageHeader, SectionHeading, Eyebrow,
                                   AccentParagraph, Columns (a heading beside its content), SplitSection (a picture beside a
                                   text; `bleed` on a phone, `align="top"` for long texts), FeatureCard, ShotCard, IconTile,
                                   StatBand, CtaBand, Doodle, ContourPattern, ArrowLink, Prose, InlineCode, LinkButton,
                                   TextLink, JsonLd
src/components/layout/             header (Product menu, mobile menu), call to action, footer, language switch, theme toggle
src/components/legal/              LegalSection and UpdatedOn: the headed sections and the "last updated" date of the privacy and accessibility pages
src/components/rich-tags.tsx       the links and `<code>` that translated texts may contain (`t.rich(key, answerTags(locale))`)
src/sections/home/gallery*.tsx     "See the app": cards made on the server (gallery.tsx), filtered by tabs, or by a select on a
                                   phone, in the client component gallery-filter.tsx (all cards are in the HTML without script)
src/lib/                           routes, i18n, translator, seo, csp, security-headers, site-url, json-ld
src/proxy.ts                       "/" redirect by Accept-Language, CSP with a nonce
```

## Look: tokens and components

Colours are the project's `bright` palette (`packages/design-tokens/src/palettes/bright.css`): the
vintage hues of the app arranged for a marketing page, with white surfaces, a near-black and one
terracotta accent. The app keeps `vintage`. Values for what cannot use CSS variables (theme colour,
manifest, icons, Open Graph images) come from `src/config/palette.ts`. The dark band of the numbers
and of the footer is the role colour `band` (with `band-fg`, `band-muted`), whose contrast is
tested in every palette and both themes. The type scale (`text-h1`, `text-h2`, `text-h3`, `text-lead`,
`text-eyebrow`, `text-stat`), the spacing (`py-section`, `mb-heading`, `px-gutter`) and the page
width (`max-w-page`, 1200px of content) are defined once, in `src/app/globals.css`. Buttons, tabs,
cards, badges, headings, text and links come from `@hybrid-rag/ui`; the landing components only
combine them. Decoration (doodle, contour lines) is inline SVG in `currentColor`, `aria-hidden`.

Sections alternate between `tone="plain"` and `tone="panel"` and have no borders. A panel (the
`surface-panel` utility in `globals.css`) sets `--card-bg` to the lighter role colour `card-raised`, which the shared
`Card` reads, so a card on a panel section never has the colour of the panel; on a plain section it keeps `surface`.
Write `surface-panel`, never `bg-panel`, for the background of a section. The call to action
and the footer come from the layout, so every page ends with them (not a 404: the call to action
is hidden there by `PageOnly`).

## The 404 page

`src/proxy.ts` answers every address that is not a page (`pageIdFromPath` in `lib/routes.ts`) with a rewrite to
`/<language>/404` and status 404. That route (`app/[locale]/404/page.tsx`) is a normal server-rendered page.
`notFound()` is not used for it on purpose: in Next 16.4 it makes the server send an empty
`<html id="__next_error__">` shell and the browser draw the 404 itself, so there is nothing to read without script,
and in `next dev` the layout's inline theme script, created on the client, is reported by React as an issue.
`app/[locale]/[...rest]` and `not-found.tsx` remain for what the proxy does not see (paths with a file extension).

## Translations

Every text a person or a machine reads (visible text, `aria-label`, `alt`, metadata, JSON-LD,
404, manifest) is a translation in `src/messages/<locale>/<namespace>.json`. Keys are typed from
the English files. In a server component:

```tsx
const { t, tp } = getTranslator(locale);          // from "@/lib/translator"
t("home.hero.title");                             // plain text
t("pricing.plan.price", { amount: "9" });         // {amount} placeholders
tp("faq.count", 3);                               // plural: { "one": ..., "few": ..., "many": ..., "other": ... }
t.rich("faq.contact", { link: (c) => <TextLink href={SITE.issues}>{c}</TextLink> });  // "Ask <link>on GitHub</link>."
```

Lists are iterated from typed key lists, not from arrays of text:
`const ITEMS = ["whatIs", "ocr"] as const;` then `ITEMS.map((id) => t(\`faq.items.${id}.q\`))`.
A client component receives the few strings it needs as props; catalogs never go to the browser.
`messages.test.ts` fails on a missing or extra key, different `{placeholders}` or `<tags>`, a missing
Polish plural form (`one`, `few`, `many`, `other`) and on a key nothing uses. Money and dates:
`Intl.NumberFormat` / `Intl.DateTimeFormat` with the locale, numbers in `src/config`.

## Screenshots

`src/config/screenshots.ts` lists the ids: `hero-chat` (1080x956, the home page hero: a crop of the chat),
`about-sources` (1080x906, the home page "why" section: a crop of the sources panel), `how-flow` (1080x956, the top of
the how-it-works page: a document indexed and an answer about it), `chat`, `sources`,
`start`, `groups`, `document`, `search-lab`, `settings` (1440x900 each) and `mobile-chat` (390x844). Until a
file exists, `<Screenshot id locale />` renders a placeholder with the same aspect ratio (no layout shift) and
`role="img"`, with the description `screenshots.<id>`; its visible text, "Screenshot: <name>", comes from
`screenshots.names.<id>`, so every placeholder says which picture goes there. On a phone the pictures at the top of
a page run to the screen edges at 375x240 and are cropped to that (object-fit cover, top left), so keep the
important part of a screenshot near its top left corner.

To replace one:

1. Take a light and a dark screenshot with exactly `width` x `height` pixels from the manifest
   (or an even multiple, e.g. 2880x1800 for 1440x900). PNG or WebP.
2. Put them in `public/screenshots/`, e.g. `chat-light.png` and `chat-dark.png`.
3. In `config/screenshots.ts` set `src: { light: "/screenshots/chat-light.png", dark: "/screenshots/chat-dark.png" }`.
4. Check that the description in `messages/{en,pl}/screenshots.json` still says what the picture shows.

The component renders a `<picture>` (optimised by `next/image`: AVIF/WebP, `sizes`) whose source follows the device theme, so only one picture is downloaded; a theme chosen on the site swaps it for a lazy image of that theme. Use `eager` on the one screenshot that is visible when the page loads (it then loads at once with high fetch priority; next/image's `priority` is deprecated in Next 16). If a picture has a different aspect ratio, change `width` and `height` too.

## Security headers

`next.config.ts` sets HSTS, COOP, `nosniff`, Referrer-Policy, Permissions-Policy and
`X-Frame-Options` on everything, and `X-Robots-Tag: noindex` on Vercel previews. `src/proxy.ts`
sets a Content-Security-Policy with a new nonce per request (`script-src 'self' 'nonce-...'
'strict-dynamic'`, `frame-ancestors 'none'`, no third-party origin anywhere). A nonce means every
page is rendered on request (the root layout reads the nonce), so pages are not served from the
CDN cache.

Measured on one machine, same Next server, the stub home page (Lighthouse: median of 3, localhost):

| | nonce, rendered on request (used) | static, CSP with `'unsafe-inline'` |
|---|---|---|
| Lighthouse mobile and desktop | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| mobile LCP, CLS, TBT | 0.8 s, 0, 30 ms | 0.8 s, 0, 40 ms |
| mean time to first byte (40 requests) | 7.8 ms | 2.6 ms |
| throughput (20 connections, 8 s) | ~400 requests/s, median latency 47 ms | ~3,800 requests/s, 4 ms |
| Lighthouse `csp-xss` | only the old-browser fallback suggestions | flags `'unsafe-inline'` |

The nonce version is the strict policy and costs no Lighthouse score; the price is a serverless
render per request on Vercel instead of a CDN hit. Trusted Types (`require-trusted-types-for
'script'`) was tried and not kept: React/Next assign `innerHTML` on the client and hydration then
fails. Source maps are public (`productionBrowserSourceMaps`): the repository is public.

## Deploying on Vercel (nothing is deployed from here)

One Vercel project for this app, from the monorepo:

1. New project, import the repository. **Root Directory: `apps/landing`**. Framework: Next.js (detected).
2. Leave "Include source files outside of the Root Directory" on (needed: `packages/*`), and
   "Automatically expose System Environment Variables" on.
3. `vercel.json` in this folder sets the install command (`npm ci` at the repository root) and the
   build command (`turbo run build --filter=@hybrid-rag/landing`). Do not override them in the dashboard.
   To skip builds of commits that do not touch this app or its packages, use Vercel's own setting
   (Project Settings, Build and Deployment, "Skip deployments when unaffected" / "Monorepos:
   skip unaffected projects"; it uses the workspace graph of the lockfile). No ignore command is
   configured, so nothing is downloaded at build time.
4. Environment variable `NEXT_PUBLIC_SITE_URL` = the production address, e.g. `https://hybrid-rag.example`.
   Without it the site uses `VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3200`. It sets
   canonical links, hreflang, the sitemap and Open Graph URLs.
5. Preview deployments are `noindex` (meta robots, `X-Robots-Tag`, `robots.txt`) automatically.
6. Node 22 (`.nvmrc`).

After the first deployment run the Lighthouse check against the real URL
(`npx lhci collect --url=...` or PageSpeed Insights): a local result does not guarantee production.
