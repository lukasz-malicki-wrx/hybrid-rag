import { expect, test } from "@playwright/test";
import { expectAccessible, expectNoHorizontalScroll, LOCALES, pathOf } from "./helpers";

const TEXT = {
  en: { notice: "Payments do not work yet and nothing can be bought", soon: "Coming soon", cta: "Get it on GitHub", tableName: "Plan comparison table" },
  pl: { notice: "Płatności jeszcze nie działają i niczego nie można kupić", soon: "Wkrótce", cta: "Pobierz z GitHuba", tableName: "Tabela porównania planów" },
} as const;

for (const locale of LOCALES) {
  const text = TEXT[locale];
  test.describe(`${pathOf(locale, "pricing")}`, () => {
    test("says first that it is a preview, and offers nothing to buy", async ({ page }) => {
      await page.goto(pathOf(locale, "pricing"));
      await expect(page.getByText(text.notice)).toBeVisible();
      // Three plans; only Free has a link to the repository; the others say "coming soon" as text.
      const plans = page.locator("section ul > li").filter({ has: page.getByRole("heading", { level: 3 }) });
      await expect(plans).toHaveCount(3);
      await expect(page.getByRole("link", { name: text.cta })).toHaveAttribute("href", /github\.com\/.+\/hybrid-rag$/);
      await expect(page.getByText(text.soon, { exact: true }).first()).toBeVisible();
      await expect(page.getByRole("link", { name: text.cta })).toHaveCount(1);
      await expect(page.locator("main button")).toHaveCount(0);
      await expect(page.locator("main input, main form")).toHaveCount(0);
    });

    test("has no Offer or Product structured data", async ({ page }) => {
      await page.goto(pathOf(locale, "pricing"));
      const json = (await page.locator('script[type="application/ld+json"]').allTextContents()).join("\n");
      expect(json).not.toMatch(/"Offer"|"Product"|"AggregateOffer"/);
    });

    test("has a real table with a caption and headers, in a labelled region the keyboard reaches", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 });
      await page.goto(pathOf(locale, "pricing"));
      const table = page.locator("table");
      await expect(table.locator("caption")).toHaveCount(1);
      await expect(table.locator('thead th[scope="col"]')).toHaveCount(4);
      const rows = await table.locator("tbody tr").count();
      expect(await table.locator('tbody th[scope="row"]').count()).toBeGreaterThan(8);
      expect(await table.locator('tbody th[scope="rowgroup"]').count()).toBe(4);
      expect(rows).toBeGreaterThan(12);
      // every icon has a text alternative next to it
      expect(await table.locator("svg").count()).toBe(await table.locator("svg + .sr-only").count());
      const region = page.getByRole("region", { name: text.tableName });
      await expect(region).toHaveAttribute("tabindex", "0");
      await region.focus();
      await expect(region).toBeFocused();
      await expectNoHorizontalScroll(page);
      await expectAccessible(page);
    });

    test("opens a question with the keyboard", async ({ page }) => {
      await page.goto(pathOf(locale, "pricing"));
      const summary = page.locator("main details summary").first();
      await summary.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("main details").first()).toHaveAttribute("open", "");
      await expectAccessible(page);
      await page.keyboard.press("Space");
      await expect(page.locator("main details").first()).not.toHaveAttribute("open", "");
    });

    test("stays readable at 200% zoom, in forced colors and with reduced motion", async ({ page }) => {
      await page.setViewportSize({ width: 640, height: 600 });
      await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
      await page.goto(pathOf(locale, "pricing"));
      await expectNoHorizontalScroll(page);
      await expect(page.locator("table")).toBeVisible();
    });
  });
}
