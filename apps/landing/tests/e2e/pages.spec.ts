import { expect, test } from "@playwright/test";
import {
  collectErrors,
  expectAccessible,
  expectNoHorizontalScroll,
  LOCALES,
  pathOf,
  SLUGS,
} from "./helpers";

const SIZES = [
  { name: "320", width: 320, height: 700 },
  { name: "1280", width: 1280, height: 800 },
] as const;
const SCHEMES = ["light", "dark"] as const;

for (const locale of LOCALES) {
  for (const slug of SLUGS) {
    const path = pathOf(locale, slug);

    test.describe(path, () => {
      for (const size of SIZES) {
        for (const scheme of SCHEMES) {
          test(`is accessible, fits ${size.name}px and logs no errors (${scheme})`, async ({ page }) => {
            await page.setViewportSize({ width: size.width, height: size.height });
            await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
            const errors = collectErrors(page);
            const response = await page.goto(path);
            expect(response?.status()).toBe(200);
            await expect(page.locator("html")).toHaveAttribute("lang", locale);
            await expect(page.locator("h1")).toHaveCount(1);
            await expect(page.getByRole("main")).toHaveCount(1);
            await expectNoHorizontalScroll(page);
            await expectAccessible(page);
            expect(errors).toEqual([]);
          });
        }
      }

      test("has a title, description, canonical and hreflang alternates", async ({ page }) => {
        await page.goto(path);
        await expect(page).toHaveTitle(/\S/);
        await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{20}/);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
        const alternates = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((els) =>
          els.map((el) => `${el.getAttribute("hreflang")} ${new URL(el.getAttribute("href") ?? "").pathname}`),
        );
        expect(alternates).toEqual([`en ${pathOf("en", slug)}`, `pl ${pathOf("pl", slug)}`, `x-default ${pathOf("en", slug)}`]);
      });
    });
  }
}

test("zooms to 200% without a horizontal scroll (a 640px wide viewport is a 1280px page at 200%)", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 500 });
  await page.goto("/en");
  await expectNoHorizontalScroll(page);
  await expectAccessible(page);
});

test("keeps every control visible in forced colors", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/en");
  await expect(page.getByRole("link", { name: "Features" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
});

test.describe("404", () => {
  for (const locale of LOCALES) {
    test(`${locale}: an unknown page shows the 404 of that language, with status 404`, async ({ page }) => {
      const errors = collectErrors(page);
      const response = await page.goto(`/${locale}/does-not-exist`);
      expect(response?.status()).toBe(404);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByRole("link", { name: locale === "en" ? "Go to the home page" : "Przejdź do strony głównej" })).toBeVisible();
      await expectAccessible(page);
      expect(errors.filter((e) => !/404/.test(e))).toEqual([]);
    });
  }

  test("an address outside the languages shows the 404 in the visitor's language, with status 404", async ({ browser }) => {
    for (const [acceptLanguage, locale, home] of [
      ["pl-PL", "pl", "Przejdź do strony głównej"],
      ["en-US", "en", "Go to the home page"],
    ] as const) {
      const context = await browser.newContext({ locale: acceptLanguage });
      const page = await context.newPage();
      const response = await page.goto("/xx/whatever");
      expect(response?.status()).toBe(404);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("link", { name: home })).toHaveAttribute("href", `/${locale}`);
      await expectAccessible(page);
      await context.close();
    }
  });
});
