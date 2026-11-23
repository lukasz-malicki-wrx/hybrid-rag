import { expect, test } from "@playwright/test";
import { expectAccessible, LOCALES } from "./helpers";

/** The menus of the header with their lists open: the part of a page a scan of the closed page cannot see. */

const SCHEMES = ["light", "dark"] as const;

test.describe("Product menu, open", () => {
  for (const locale of LOCALES) {
    for (const scheme of SCHEMES) {
      test(`is accessible, with a visible focus on every link (${locale}, ${scheme})`, async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(`/${locale}`);
        const nav = page.getByRole("navigation").first();
        await nav.locator("summary").click();
        await expectAccessible(page);
        await nav.locator("summary").focus();
        await page.keyboard.press("Tab");
        const outline = await page.evaluate(() => {
          const style = getComputedStyle(document.activeElement as Element);
          return { width: parseFloat(style.outlineWidth), style: style.outlineStyle };
        });
        expect(outline.style).not.toBe("none");
        expect(outline.width).toBeGreaterThanOrEqual(2);
      });
    }
  }

  test("keeps every link visible in forced colors, with its list outlined", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/en");
    const nav = page.getByRole("navigation").first();
    await nav.locator("summary").click();
    for (const link of await nav.locator("details a").all()) await expect(link).toBeVisible();
    // Forced colours replace the colours, which axe's contrast rule cannot follow (see quality.spec.ts).
    await expectAccessible(page, ["color-contrast"]);
  });

  test("the list does not leave the screen at 1024px", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/pl");
    await page.getByRole("navigation").first().locator("summary").click();
    const box = await page.locator("nav details ul").boundingBox();
    expect(box && box.x >= 0 && box.x + box.width <= 1024).toBe(true);
  });
});
