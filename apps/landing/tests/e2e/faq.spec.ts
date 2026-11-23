import { expect, test } from "@playwright/test";
import { expectAccessible, expectNoHorizontalScroll, LOCALES, pathOf } from "./helpers";

for (const locale of LOCALES) {
  test.describe(`${pathOf(locale, "faq")}`, () => {
    test("opens and closes a question with Enter and Space", async ({ page }) => {
      await page.goto(pathOf(locale, "faq"));
      const first = page.locator("main details").first();
      await first.locator("summary").focus();
      await page.keyboard.press("Enter");
      await expect(first).toHaveAttribute("open", "");
      await page.keyboard.press("Space");
      await expect(first).not.toHaveAttribute("open", "");
    });

    test("is accessible with every question open, at 320px and wide, light and dark", async ({ page }) => {
      for (const [width, scheme] of [[320, "light"], [1280, "dark"]] as const) {
        await page.setViewportSize({ width, height: 800 });
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(pathOf(locale, "faq"));
        await page.locator("main details").evaluateAll((els) => els.forEach((el) => el.setAttribute("open", "")));
        await expectNoHorizontalScroll(page);
        await expectAccessible(page);
      }
    });

    test("has a FAQPage JSON-LD that matches the questions on the page, in plain text", async ({ page }) => {
      await page.goto(pathOf(locale, "faq"));
      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      const faq = blocks.map((b) => JSON.parse(b)).find((d) => d["@type"] === "FAQPage");
      expect(faq).toBeTruthy();
      const questions: string[] = faq.mainEntity.map((q: { name: string }) => q.name);
      const shown = (await page.locator("main details summary span").allTextContents()).map((s) => s.replace(/ /g, " ").trim());
      expect(questions).toEqual(shown);
      for (const q of faq.mainEntity) {
        expect(q.acceptedAnswer.text).not.toMatch(/<\/?\w+>/);
        expect(q.acceptedAnswer.text.length).toBeGreaterThan(40);
      }
    });

    test("groups the questions under headings and has one h1", async ({ page }) => {
      await page.goto(pathOf(locale, "faq"));
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main h3")).toHaveCount(5);
    });
  });
}

test("says in full what LLM_PROVIDER=anthropic sends to Anthropic", async ({ page }) => {
  await page.goto(pathOf("en", "faq"));
  const answer = page.locator("main details", { hasText: "Where does my data go?" }).first();
  await expect(answer).toContainText("LLM_PROVIDER=anthropic");
  for (const part of ["the question", "turns of the conversation", "personal context", "excerpts"]) await expect(answer).toContainText(part);
});
