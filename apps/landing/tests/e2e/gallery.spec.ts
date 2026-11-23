import { expect, test } from "@playwright/test";
import { expectAccessible, LOCALES, pathOf } from "./helpers";

/** The gallery of the home page: tabs from sm up, a select below it. */

const SCHEMES = ["light", "dark"] as const;

test.describe("the gallery on a phone", () => {
  test.use({ viewport: { width: 375, height: 800 } });

  for (const locale of LOCALES) {
    test(`is a named select with the same areas, not cut-off tabs (${locale})`, async ({ page }) => {
      await page.goto(pathOf(locale, ""));
      const name = locale === "en" ? "Areas of the app" : "Obszary aplikacji";
      await expect(page.getByRole("tablist")).toBeHidden();
      const select = page.getByRole("combobox", { name });
      await expect(select).toBeVisible();
      const options = await select.locator("option").allTextContents();
      expect(options).toHaveLength(5);
      const box = await select.boundingBox();
      expect(box && box.x >= 0 && box.x + box.width <= 375).toBe(true);
      // The panel is a labelled region for a select, not a tab panel for tabs that are not there.
      const region = page.getByRole("region", { name: options[0] });
      await expect(region.getByRole("listitem")).toHaveCount(6);
      await select.selectOption({ index: 1 });
      await expect(page.getByRole("region", { name: options[1] }).getByRole("listitem")).toHaveCount(2);
      await select.selectOption({ index: 0 });
      await expect(page.getByRole("region", { name: options[0] }).getByRole("listitem")).toHaveCount(6);
    });
  }

  test("is accessible and does not scroll sideways at 320px, in both themes", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    for (const scheme of SCHEMES) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/en");
      await page.getByRole("combobox").selectOption({ index: 2 });
      await expectAccessible(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    }
  });

  test("works with the keyboard", async ({ page }) => {
    await page.goto("/en");
    const select = page.getByRole("combobox");
    await select.focus();
    await expect(select).toBeFocused();
    // Typing the first letters picks an option on every platform (arrow keys only open the list on macOS).
    await page.keyboard.type("Ch");
    await page.keyboard.press("Enter");
    await expect(select).toHaveValue("chat");
    await expect(page.getByRole("region", { name: "Chat" }).getByRole("listitem")).toHaveCount(2);
  });
});

test.describe("the gallery from sm up", () => {
  test("shows tabs, no select, and the panel is a tab panel named by the selected tab", async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 800 });
    await page.goto("/en");
    await expect(page.getByRole("combobox")).toBeHidden();
    const tabs = page.getByRole("tablist").getByRole("tab");
    await expect(tabs).toHaveCount(5);
    const box = await page.getByRole("tablist").boundingBox();
    expect(box && box.x >= 0 && box.x + box.width <= 640).toBe(true);
    await expect(page.getByRole("tabpanel")).toHaveAccessibleName("All");
    for (const scheme of SCHEMES) {
      await page.emulateMedia({ colorScheme: scheme });
      await expectAccessible(page);
    }
  });

  test("switches from tabs to the select when the window narrows, keeping the chosen area", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 800 });
    await page.goto("/en");
    await page.getByRole("tab", { name: "Sources" }).click();
    await page.setViewportSize({ width: 375, height: 800 });
    await expect(page.getByRole("combobox")).toHaveValue("sources");
    await expect(page.getByRole("region", { name: "Sources" }).getByRole("listitem")).toHaveCount(1);
  });
});
