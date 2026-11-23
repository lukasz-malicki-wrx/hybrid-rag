import { expect, test } from "@playwright/test";
import { LOCALES, pathOf } from "./helpers";

const UPDATED = { en: "Last updated: November 22, 2026", pl: "Ostatnia aktualizacja: 22 listopada 2026" } as const;

test("what the privacy page says about the site is true of the site", async ({ page, context, baseURL }) => {
  const origins = new Set<string>();
  page.on("request", (request) => origins.add(new URL(request.url()).origin));
  for (const slug of ["", "how-it-works", "privacy", "accessibility"]) await page.goto(pathOf("en", slug));
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => document.cookie)).toBe("");
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  expect([...origins]).toEqual([new URL(baseURL ?? "").origin]);
  await expect(page.locator("form")).toHaveCount(0);

  // The only thing kept, and only after the theme switch is used, is the theme, under the key the page names.
  await page.goto(pathOf("en", "privacy"));
  await page.getByRole("button", { name: /Switch to (dark|light) theme/ }).click();
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(["hybrid-rag:theme"]);
  await expect(page.getByRole("main").locator("code", { hasText: "hybrid-rag:theme" })).toBeVisible();
  expect(await context.cookies()).toEqual([]);
});

for (const locale of LOCALES) {
  test.describe(`privacy (${locale})`, () => {
    test("is dated with a machine-readable date, and names who is responsible", async ({ page }) => {
      await page.goto(pathOf(locale, "privacy"));
      await expect(page.getByText(UPDATED[locale])).toBeVisible();
      await expect(page.locator("time")).toHaveAttribute("datetime", "2026-11-22");
      await expect(page.getByRole("main")).toContainText("Lukasz Malicki");
      await expect(page.getByRole("main")).not.toContainText("@");
    });

    test("links to the host's and Anthropic's notices and to GitHub Issues", async ({ page }) => {
      await page.goto(pathOf(locale, "privacy"));
      const main = page.getByRole("main");
      await expect(main.locator('a[href="https://vercel.com/legal/privacy-notice"]')).toHaveCount(1);
      await expect(main.locator('a[href="https://www.anthropic.com/legal/privacy"]')).toHaveCount(1);
      await expect(main.locator('a[href$="/hybrid-rag/issues"]')).toHaveCount(1);
    });

    test("keeps the website and the app apart, and says what goes to Anthropic", async ({ page }) => {
      await page.goto(pathOf(locale, "privacy"));
      await expect(page.getByRole("region", { name: locale === "en" ? "This website" : "Ta strona internetowa" })).toBeVisible();
      const app = page.getByRole("region", { name: locale === "en" ? "The hybrid-rag app" : "Aplikacja hybrid-rag" });
      await expect(app).toContainText("LLM_PROVIDER=anthropic");
      await expect(app).toContainText("127.0.0.1");
    });
  });
}
