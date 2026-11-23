import { NextResponse, type NextRequest } from "next/server";
import { buildCsp, createNonce } from "@/lib/csp";
import { isLocale, negotiateLocale } from "@/lib/i18n";
import { pageIdFromPath } from "@/lib/routes";
import { siteUrl } from "@/lib/site-url";

/**
 * Runs before every page: "/" goes to the visitor's language (307, so that a changed browser
 * language is respected next time), every other page gets a Content-Security-Policy with a fresh
 * nonce. Next reads the nonce from the request's CSP header and puts it on its own scripts.
 *
 * An address that is not a page gets the 404 page of its language here, with status 404. It is a
 * page of its own (`[locale]/404`) because `notFound()` makes Next 16 answer with an empty
 * `<html id="__next_error__">` shell and draw the 404 in the browser: with no script the visitor
 * saw a blank page, and in `next dev` the layout's inline script was created on the client and
 * React reported it as an issue.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = negotiateLocale(request.headers.get("accept-language"));
  if (pathname === "/") {
    const redirect = NextResponse.redirect(new URL(`/${locale}`, request.url), 307);
    redirect.headers.set("Vary", "Accept-Language");
    return redirect;
  }

  const nonce = createNonce();
  const csp = buildCsp({
    nonce,
    dev: process.env.NODE_ENV === "development",
    upgradeInsecure: siteUrl().startsWith("https:"),
  });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  // An address outside /en and /pl has no language of its own: it is answered in the visitor's.
  const first = pathname.split("/")[1] ?? "";
  const response = pageIdFromPath(pathname)
    ? NextResponse.next({ request: { headers: requestHeaders } })
    : NextResponse.rewrite(new URL(`/${isLocale(first) ? first : locale}/404`, request.url), {
        request: { headers: requestHeaders },
        status: 404,
      });
  if (!isLocale(first)) response.headers.set("Vary", "Accept-Language");
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Pages, and anything that is not a file of the site: not the build output, the generated images and the
      // files that exist (the sitemap, robots, the manifest, the icon, the screenshots). An address that looks like a
      // file but is not one (/en/x.txt, /x.png) is a page that does not exist and gets the 404 page.
      source:
        "/((?!_next/static|_next/image|apple-icon|.*opengraph-image|screenshots/|icon\\.svg|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest).*)",
      // Link prefetches carry no document, so they need no policy.
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
