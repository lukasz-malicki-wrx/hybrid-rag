import { expect, test } from "@playwright/test";

test.describe("features page", () => {
  for (const locale of ["en", "pl"] as const) {
    test(`${locale}: the overview cards link to every group`, async ({ page }) => {
      await page.goto(`/${locale}/features`);
      const overview = page.locator("section", { has: page.locator("#features-overview") });
      const hrefs = await overview.getByRole("link").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
      expect(hrefs).toEqual(["#chat", "#sources", "#documents", "#scope", "#quality", "#access"]);
      for (const href of hrefs) await expect(page.locator(href ?? "")).toHaveCount(1);
      // the overview, the six groups, and nothing else
      await expect(page.locator("main section")).toHaveCount(hrefs.length + 1);
    });
  }

  test("follows an overview link to its group", async ({ page }) => {
    await page.goto("/en/features");
    await page.getByRole("link", { name: "Quality control in detail" }).click();
    await expect(page).toHaveURL(/#quality$/);
    await expect(page.getByRole("heading", { level: 2, name: "Quality control" })).toBeInViewport();
  });

  test("states the favourites limit and links the evaluation", async ({ page }) => {
    await page.goto("/en/features");
    await expect(page.getByRole("heading", { name: "Up to 10 favourites" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Read the evaluation on GitHub" })).toHaveAttribute("href", /docs\/EVALUATION\.md$/);
  });
});
