import { expect, test, type Page } from "@playwright/test";
import { expectAccessible } from "./a11y";
import { json, MOCK, mockApi } from "./mock-api";

const LIGHT = "light";
const DARK = "dark";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await page.route(`**${MOCK}/settings`, (r) => json(r, { personal_context: "", updated_at: null }));
});

/** Brightness of the page background (0-255), so the tests do not depend on the palette. */
const brightness = (page: Page) =>
  page.locator("body").evaluate((el) => {
    const [r, g, b] = getComputedStyle(el).backgroundColor.match(/\d+/g)!.map(Number);
    return (r + g + b) / 3;
  });

const expectBackground = (page: Page, theme: typeof LIGHT | typeof DARK) =>
  expect.poll(() => brightness(page))[theme === LIGHT ? "toBeGreaterThan" : "toBeLessThan"](128);

async function chooseAppearance(page: Page, option: string) {
  await page.getByRole("button", { name: "Settings" }).click();
  const dialog = page.getByRole("dialog", { name: "Settings" });
  await dialog.getByRole("group", { name: "Appearance" }).getByRole("radio", { name: option }).check();
  await expectAccessible(page);
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog).toBeHidden();
}

test("by default the theme follows the system, also when it changes", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await expectBackground(page, DARK);
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await expectBackground(page, LIGHT);
});

test("the light theme overrides a dark system and is remembered", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/");
  await chooseAppearance(page, "Light");
  await expectBackground(page, LIGHT);
  await expectAccessible(page);

  await page.reload();
  await expect(page.getByRole("heading", { name: "What do you want to know?" })).toBeVisible();
  await expectBackground(page, LIGHT);
  expect(errors.filter((e) => /hydrat|script tag/i.test(e))).toEqual([]);
});

test("the dark theme overrides a light system; system default restores it", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/");
  await chooseAppearance(page, "Dark");
  await expectBackground(page, DARK);
  await expectAccessible(page);

  await chooseAppearance(page, "System default");
  await expectBackground(page, LIGHT);
});

test("a saved theme applies before the app's JavaScript runs (no flash)", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/");
  await chooseAppearance(page, "Dark");
  await expectBackground(page, DARK);

  await page.route("**/_next/static/**/*.js", (r) => r.abort());
  await page.reload({ waitUntil: "domcontentloaded" });
  await expectBackground(page, DARK);
});

test("the pill in the rail flips between light and dark, and the choice is remembered", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/");
  await expectBackground(page, LIGHT);
  const toDark = page.getByRole("complementary", { name: "Sidebar" }).getByRole("button", { name: "Switch to dark theme" });
  await toDark.click();
  await expectBackground(page, DARK);
  await expectAccessible(page);

  const toLight = page.getByRole("button", { name: "Switch to light theme" });
  await expect(toLight).toBeVisible();
  await expect(page.getByRole("button", { name: "Switch to dark theme" })).toHaveCount(0);

  await page.reload();
  await expectBackground(page, DARK);
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expectBackground(page, LIGHT);
  await expectAccessible(page);
});

test("with the system theme the pill shows what the device shows, and Settings still offers System default", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expectBackground(page, LIGHT);

  await chooseAppearance(page, "System default");
  await expectBackground(page, DARK);
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
});
