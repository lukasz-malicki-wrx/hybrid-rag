import { expect, test, type Page } from "@playwright/test";
import { expectAccessible } from "./a11y";
import { answeredMessage, conversation, json, MOCK, mockApi, source } from "./mock-api";

const thread = (page: Page) => page.getByRole("list", { name: "Messages" });

function answer(text: string, extra: object = {}) {
  return { ...answeredMessage, answer: { ...answeredMessage.answer, text, ...extra } };
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

async function open(page: Page, message: object) {
  await page.route(`**${MOCK}/conversations/c1`, (r) =>
    json(r, { ...conversation, documents: [], messages: [message] }),
  );
  await page.goto("/c/c1");
}

test("Markdown in an answer is shown as lists and emphasis, with working citations", async ({ page }) => {
  const text = "Two steps:\n\n1. Plug in the **adapter** [1].\n\n2. Reset the `counter`.\n- a note";
  await open(page, answer(text, { sources: [source] }));
  const body = thread(page);
  await expect(body.locator("ol > li", { hasText: "Plug in the adapter" })).toBeVisible();
  await expect(body.locator("ol > li")).toHaveCount(2);
  await expect(body.locator("ul > li", { hasText: "a note" })).toHaveCount(1);
  await expect(body.locator("strong", { hasText: "adapter" })).toBeVisible();
  await expect(body.locator("code", { hasText: "counter" })).toBeVisible();
  // No raw marks are left in the text.
  await expect(body).not.toContainText("**");
  await expect(body).not.toContainText("1. Plug");
  await body.getByRole("button", { name: "Source 1: annex11.pdf, page 5" }).click();
  await expect(page.getByRole("complementary", { name: "Sources" })).toBeVisible();
  await expectAccessible(page);
});

test("HTML in an answer stays text", async ({ page }) => {
  await open(page, answer("<img src=x onerror=alert(1)> <b>bold</b>"));
  await expect(thread(page)).toContainText("<b>bold</b>");
  await expect(thread(page).locator("img")).toHaveCount(0);
});

test("a refusal is shown in the language of the interface", async ({ page }) => {
  await open(page, answer("I could not find this in the provided documents.", { refused: true, citations: [], sources: [] }));
  await expect(thread(page)).toContainText("The documents searched do not contain the answer to this question.");
  await expect(thread(page)).not.toContainText("I could not find");
  await page.getByRole("complementary", { name: "Sidebar" }).getByRole("combobox", { name: "Language" }).selectOption("pl");
  await expect(page.getByRole("list", { name: "Wiadomości" })).toContainText(
    "Przeszukane dokumenty nie zawierają odpowiedzi na to pytanie.",
  );
});
