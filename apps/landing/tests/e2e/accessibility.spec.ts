import { expect, test, type Page } from "@playwright/test";
import { LOCALES, pathOf } from "./helpers";

const PAGES = ["how-it-works", "privacy", "accessibility"] as const;

/**
 * Links and buttons that are not part of a sentence: the ones WCAG 2.5.8 holds to 24 by 24 pixels.
 * The skip link is left out: it is out of sight until it is focused, and then it is large.
 */
async function smallTargets(page: Page) {
  return page.locator("a, button, summary").evaluateAll((els) =>
    els
      .filter((el) => !el.closest("p") && el.getAttribute("href") !== "#main" && el.getBoundingClientRect().width > 0)
      .map((el) => ({ text: (el.textContent ?? "").trim().slice(0, 30), box: el.getBoundingClientRect() }))
      .filter(({ box }) => box.width < 24 || box.height < 24)
      .map(({ text, box }) => `${text} ${Math.round(box.width)}x${Math.round(box.height)}`),
  );
}

test.describe("what the accessibility statement claims", () => {
  for (const locale of LOCALES) {
    for (const slug of PAGES) {
      for (const width of [320, 1280]) {
        test(`${locale}/${slug} at ${width}px: targets of at least 24px, and no sideways scroll at 200% zoom`, async ({ page }) => {
          await page.setViewportSize({ width, height: 800 });
          await page.goto(pathOf(locale, slug));
          expect(await smallTargets(page)).toEqual([]);
          // 200% zoom of a 1280px (or 320px) page is a viewport of half the width.
          await page.setViewportSize({ width: width / 2 < 320 ? 320 : width / 2, height: 800 });
          expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
        });
      }
    }
  }

  test("the skip link and then the page can be driven by keyboard alone, down to the code blocks", async ({ page }) => {
    await page.goto(pathOf("en", "how-it-works"));
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    let reachedCode = false;
    for (let i = 0; i < 120 && !reachedCode; i++) {
      await page.keyboard.press("Tab");
      reachedCode = await page.evaluate(() => document.activeElement?.tagName === "FIGURE");
    }
    expect(reachedCode).toBe(true);
    // The focus is visible: an outline is drawn.
    expect(await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle)).not.toBe("none");
  });

  test("works without JavaScript: the statement can be read", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(pathOf("en", "accessibility"));
    await expect(page.getByRole("heading", { level: 1, name: "Accessibility statement" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Known limits" })).toBeVisible();
    await context.close();
  });

  for (const locale of LOCALES) {
    test(`${locale}: the statement is dated, claims neither certification nor full conformance, and says how to report`, async ({ page }) => {
      await page.goto(pathOf(locale, "accessibility"));
      const main = page.getByRole("main");
      await expect(page.locator("time")).toHaveAttribute("datetime", "2026-11-22");
      await expect(main).toContainText("WCAG 2.2");
      await expect(main).not.toContainText(/certified|zgodna w pełni|fully compliant|w pełni zgodn/i);
      await expect(main.locator('a[href$="/hybrid-rag/issues"]')).toHaveCount(1);
      await expect(main.getByRole("heading", { level: 2 })).toHaveCount(5);
    });
  }
});
