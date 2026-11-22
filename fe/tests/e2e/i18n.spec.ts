import { expect, test } from "@playwright/test";
import { expectAccessible } from "./a11y";
import { json, MOCK, mockApi } from "./mock-api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await page.route(`**${MOCK}/settings`, (r) => json(r, { personal_context: "", updated_at: null }));
});

test.describe("Polish browser", () => {
  test.use({ locale: "pl-PL" });

  test("the UI follows the browser language and stays accessible", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Czego chcesz się dowiedzieć?" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Szukam we wszystkich dokumentach" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "pl");
    await expectAccessible(page);
    // The server renders English; switching to Polish after hydration must not cause errors.
    expect(errors.filter((e) => /hydrat/i.test(e))).toEqual([]);
  });

  test("Polish plural forms are used", async ({ page }) => {
    await page.goto("/g/g1");
    await page.getByRole("button", { name: "Usuń grupę" }).click();
    const dialog = page.getByRole("dialog", { name: "Usunąć grupę „GxP”?" });
    await expect(dialog).toContainText("W tej grupie są 3 rozmowy. Wszystkie zostaną usunięte.");
    await expect(dialog.getByRole("button", { name: "Usuń grupę i 3 rozmowy" })).toBeVisible();
  });

  test("English can be chosen in Settings and is remembered", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ustawienia" }).click();
    const dialog = page.getByRole("dialog", { name: "Ustawienia" });
    await dialog.getByRole("radio", { name: "English" }).check();
    await dialog.getByRole("button", { name: "Zapisz" }).click();

    await expect(page.getByRole("heading", { name: "What do you want to know?" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "What do you want to know?" })).toBeVisible();
  });
});

test("an unsupported browser language falls back to English", async ({ browser }) => {
  const context = await browser.newContext({ locale: "de-DE" });
  const page = await context.newPage();
  await mockApi(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "What do you want to know?" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await context.close();
});

test("the language can be switched next to Settings in the sidebar", async ({ page }) => {
  await page.goto("/");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  const select = sidebar.getByRole("combobox", { name: "Language" });
  await expect(select).toHaveValue("en");

  await select.selectOption("pl");
  await expect(page.getByRole("heading", { name: "Czego chcesz się dowiedzieć?" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Panel boczny" }).getByRole("combobox", { name: "Język" })).toHaveValue("pl");
  await expectAccessible(page);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Czego chcesz się dowiedzieć?" })).toBeVisible();
});
