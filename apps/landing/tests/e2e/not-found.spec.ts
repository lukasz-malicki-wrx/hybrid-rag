import { expect, test } from "@playwright/test";
import { expectAccessible, LOCALES } from "./helpers";

const TEXTS = {
  en: { h1: "This page does not exist", home: "Go to the home page", features: "See the features", faq: "Read the FAQ" },
  pl: { h1: "Ta strona nie istnieje", home: "Przejdź do strony głównej", features: "Zobacz funkcje", faq: "Przeczytaj FAQ" },
} as const;

for (const locale of LOCALES) {
  test.describe(`404 (${locale})`, () => {
    const texts = TEXTS[locale];

    test("answers with status 404, is kept out of search results and has its own title", async ({ page }) => {
      const response = await page.goto(`/${locale}/no-such-page`);
      expect(response?.status()).toBe(404);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(texts.h1);
      await expect(page).toHaveTitle(locale === "en" ? "Page not found" : "Nie znaleziono strony");
    });

    test("links home, to the features and to the FAQ, in the same language", async ({ page }) => {
      await page.goto(`/${locale}/no-such-page/deeper`);
      const main = page.getByRole("main");
      await expect(main.getByRole("link", { name: texts.home })).toHaveAttribute("href", `/${locale}`);
      await expect(main.getByRole("link", { name: texts.features })).toHaveAttribute("href", `/${locale}/features`);
      await expect(main.getByRole("link", { name: texts.faq })).toHaveAttribute("href", `/${locale}/faq`);
      await main.getByRole("link", { name: texts.faq }).click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/faq$`));
    });

    test("is accessible in the light and the dark theme at 320px", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 });
      for (const colorScheme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme });
        await page.goto(`/${locale}/no-such-page`);
        await expectAccessible(page);
      }
    });
  });
}

test.describe("404", () => {
  for (const locale of LOCALES) {
    test(`${locale}: the 404 is in the HTML, not drawn by the browser, so it reads without script`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
      const page = await context.newPage();
      const response = await page.goto(`/${locale}/no-such-page`);
      expect(response?.status()).toBe(404);
      expect(await response?.text()).not.toContain('id="__next_error__"');
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await context.close();
    });
  }
});

test.describe("404 for addresses that look like files", () => {
  for (const path of ["/en/x.txt", "/pl/a/b.png", "/missing.png"]) {
    test(`${path}: status 404 and the page is readable without script, while real files are served`, async ({ browser, baseURL, request }) => {
      const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
      const page = await context.newPage();
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      expect(await response?.text()).not.toContain('id="__next_error__"');
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await context.close();
      for (const file of ["/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/icon.svg"]) {
        expect((await request.get(file)).status(), file).toBe(200);
      }
    });
  }
});
