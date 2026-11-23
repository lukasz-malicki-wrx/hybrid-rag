import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SITE_PALETTE } from "@/config/palette";
import { SkipLink } from "@hybrid-rag/ui/skip-link";
import { THEME_SCRIPT } from "@hybrid-rag/ui/theme";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SITE } from "@/config/site";
import { isLocale, LOCALES } from "@/lib/i18n";
import { siteUrl } from "@/lib/site-url";
import { getTranslator } from "@/lib/translator";
import interLatin from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2";
import "../globals.css";

// A language that is not listed is a 404, not rendered on demand.
export const dynamicParams = true;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  applicationName: SITE.name,
  authors: [{ name: SITE.author.name, url: SITE.linkedin }],
  // Phone numbers in the text are not turned into links.
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The browser's own UI follows the page colours (--bg of the palette).
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITE_PALETTE.bg.light },
    { media: "(prefers-color-scheme: dark)", color: SITE_PALETTE.bg.dark },
  ],
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  // Set by src/proxy.ts for this request; the inline script below only runs with it (CSP).
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const { t } = getTranslator(locale);
  return (
    <html lang={locale} className="antialiased" suppressHydrationWarning>
      <head>
        {/* The font of the first paint: fetched with the HTML, not after the CSS is parsed. */}
        <link rel="preload" href={interLatin} as="font" type="font/woff2" crossOrigin="anonymous" />
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <SkipLink label={t("common.skipToContent")} />
        <SiteHeader locale={locale} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
