import { expect, test } from "@playwright/test";
import { LOCALES, SLUGS, pathOf } from "./helpers";

const WIDTH = 1200;
const HEIGHT = 630;

/** The width and height from the header of a PNG file. */
function pngSize(png: Buffer) {
  expect(png.subarray(1, 4).toString("latin1")).toBe("PNG");
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

test.describe("Open Graph images", () => {
  for (const locale of LOCALES) {
    for (const slug of SLUGS) {
      const path = pathOf(locale, slug);
      const id = slug || "home";

      test(`${path}: the page points at its own 1200x630 image, with a description, for Open Graph and Twitter`, async ({ page, request }) => {
        await page.goto(path);
        const meta = (selector: string) => page.locator(selector).getAttribute("content");
        const og = new URL((await meta('meta[property="og:image"]')) ?? "");
        expect(og.pathname).toBe(`/opengraph-image/${locale}/${id}`);
        expect(og.protocol).toMatch(/^https?:$/); // absolute: crawlers do not resolve relative addresses
        expect(await meta('meta[property="og:image:width"]')).toBe(String(WIDTH));
        expect(await meta('meta[property="og:image:height"]')).toBe(String(HEIGHT));
        expect(await meta('meta[property="og:image:alt"]')).toMatch(/.{20}/);
        expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");
        expect(new URL((await meta('meta[name="twitter:image"]')) ?? "").pathname).toBe(og.pathname);
        expect(await meta('meta[name="twitter:image:alt"]')).toMatch(/.{20}/);

        const image = await request.get(og.pathname);
        expect(image.status()).toBe(200);
        expect(image.headers()["content-type"]).toBe("image/png");
        expect(pngSize(await image.body())).toEqual({ width: WIDTH, height: HEIGHT });
      });
    }
  }

  test("differ by language and by page, and are served without the page's Content-Security-Policy", async ({ request }) => {
    const get = async (path: string) => request.get(path);
    const [en, pl, other] = await Promise.all([get("/opengraph-image/en/privacy"), get("/opengraph-image/pl/privacy"), get("/opengraph-image/en/faq")]);
    const bodies = await Promise.all([en.body(), pl.body(), other.body()]);
    expect(bodies[0]?.equals(bodies[1] ?? Buffer.alloc(0))).toBe(false);
    expect(bodies[0]?.equals(bodies[2] ?? Buffer.alloc(0))).toBe(false);
    // The proxy skips the images (its matcher): no page policy and no redirect on them.
    expect(en.headers()["content-security-policy"]).toBeUndefined();
    expect(en.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("an image for an unknown language or page is a 404, not an image", async ({ request }) => {
    for (const path of ["/opengraph-image/de/home", "/opengraph-image/en/nothing"]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(404);
      expect(response.headers()["content-type"] ?? "").not.toContain("image/png");
    }
  });
});
