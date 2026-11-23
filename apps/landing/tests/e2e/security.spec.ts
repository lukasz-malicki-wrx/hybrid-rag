import { expect, test } from "@playwright/test";

test.describe("security headers", () => {
  test("every page has the CSP with a nonce, HSTS, COOP, nosniff, Referrer-Policy, Permissions-Policy and no framing", async ({ request }) => {
    const response = await request.get("/en/features");
    const h = response.headers();
    expect(h["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[\w+/=]+' 'strict-dynamic'/);
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["content-security-policy"]).not.toContain("unsafe-eval");
    expect(h["strict-transport-security"]).toContain("max-age=");
    expect(h["cross-origin-opener-policy"]).toBe("same-origin");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBeTruthy();
    expect(h["permissions-policy"]).toContain("camera=()");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-powered-by"]).toBeUndefined();
    expect(h.link, "no preconnect/preload Link header from React").toBeUndefined();
  });

  test("static files have the non-CSP headers too", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("the nonce is new for every request, and is on every script", async ({ request }) => {
    const nonce = async () => /'nonce-([^']+)'/.exec((await request.get("/en")).headers()["content-security-policy"] ?? "")?.[1];
    expect(await nonce()).not.toBe(await nonce());
    const html = await (await request.get("/en")).text();
    const scripts = html.match(/<script(?![^>]*application\/ld\+json)[^>]*>/g) ?? [];
    expect(scripts.length).toBeGreaterThan(0);
    for (const tag of scripts) expect(tag, tag).toMatch(/nonce="/);
  });

  test("the page makes no request to another origin", async ({ page, baseURL }) => {
    const foreign: string[] = [];
    page.on("request", (r) => {
      if (new URL(r.url()).origin !== new URL(baseURL ?? "").origin) foreign.push(r.url());
    });
    await page.goto("/en");
    await page.goto("/pl/faq");
    expect(foreign).toEqual([]);
  });

  test("the site sets no cookies", async ({ page, context }) => {
    await page.goto("/en");
    expect(await context.cookies()).toEqual([]);
  });
});

test.describe("seo files", () => {
  test("the sitemap lists every page in both languages with alternates", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect((xml.match(/<url>/g) ?? []).length).toBe(16);
    expect(xml).toContain('hreflang="x-default"');
    expect(xml).toContain("/pl/how-it-works");
  });

  test("robots allows indexing and points at the sitemap", async ({ request }) => {
    const text = await (await request.get("/robots.txt")).text();
    expect(text).toContain("Allow: /");
    expect(text).toContain("Sitemap:");
  });

  test("the manifest and the icons exist", async ({ request }) => {
    expect((await request.get("/manifest.webmanifest")).ok()).toBe(true);
    expect((await request.get("/icon.svg")).ok()).toBe(true);
    expect((await request.get("/apple-icon")).ok()).toBe(true);
  });
});
