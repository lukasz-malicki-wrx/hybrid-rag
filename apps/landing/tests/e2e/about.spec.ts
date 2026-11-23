import { expect, test } from "@playwright/test";
import { LOCALES, pathOf } from "./helpers";

for (const locale of LOCALES) {
  test.describe(`${pathOf(locale, "about")}`, () => {
    test("links to the author's GitHub and LinkedIn, and has no e-mail", async ({ page }) => {
      await page.goto(pathOf(locale, "about"));
      const main = page.getByRole("main");
      await expect(main.locator('a[href="https://github.com/lukasz-malicki-wrx"]')).toHaveCount(1);
      await expect(main.locator('a[href="https://www.linkedin.com/in/qweluke"]')).toHaveCount(1);
      await expect(main.locator('a[href^="mailto:"]')).toHaveCount(0);
      // No photo of the author: the only pictures are screenshots of the app.
      await expect(main.locator('img:not([src*="screenshots"])')).toHaveCount(0);
      await expect(main).not.toContainText("@");
    });

    test("has Person structured data with the name and the two profiles only", async ({ page }) => {
      await page.goto(pathOf(locale, "about"));
      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      const person = blocks.map((b) => JSON.parse(b)).find((d) => d["@type"] === "Person");
      expect(person.name).toBe("Lukasz Malicki");
      expect(person.sameAs).toEqual(["https://github.com/lukasz-malicki-wrx", "https://www.linkedin.com/in/qweluke"]);
      expect(Object.keys(person).sort()).toEqual(["@context", "@type", "name", "sameAs", "url"]);
    });

    test("has a heading hierarchy without gaps", async ({ page }) => {
      await page.goto(pathOf(locale, "about"));
      const levels = await page.locator("main :is(h1,h2,h3)").evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
      expect(levels[0]).toBe(1);
      levels.forEach((level, i) => i > 0 && expect(level - (levels[i - 1] ?? 0)).toBeLessThanOrEqual(1));
    });
  });
}
