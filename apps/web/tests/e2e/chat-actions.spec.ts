import { expect, test, type Page } from "@playwright/test";
import { expectAccessible } from "./a11y";
import { ago, answeredMessage, conversation, json, MOCK, mockApi, sse } from "./mock-api";

const ANSWER = "Only Qualified Persons may certify batch release.";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

const thread = (page: Page) => page.getByRole("list", { name: "Messages" });

/** Serves c1 with the given messages. */
async function withMessages(page: Page, messages: object[]) {
  await page.route(`**${MOCK}/conversations/c1`, (r) => json(r, { ...conversation, documents: [], messages }));
}

test.describe("copy", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("Copy puts the answer on the clipboard without its source markers", async ({ page }) => {
    await page.goto("/c/c1");
    const copy = thread(page).getByRole("button", { name: "Copy answer" });
    await copy.click();
    await expect(thread(page).getByRole("button", { name: "Copied" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(ANSWER);
    // The confirmation is also announced, and goes away after a moment.
    await expect(thread(page).getByRole("status")).toHaveText("Copied");
    await expect(thread(page).getByRole("button", { name: "Copy answer" })).toBeVisible({ timeout: 5000 });
  });
});

test("a clipboard that refuses is reported", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new DOMException("denied", "NotAllowedError")) },
    });
  });
  await page.goto("/c/c1");
  await thread(page).getByRole("button", { name: "Copy answer" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Could not copy" })).toBeVisible();
  await expect(thread(page).getByRole("button", { name: "Copy answer" })).toBeVisible();
});

test.describe("rating", () => {
  const good = (page: Page) => thread(page).getByRole("button", { name: "Good answer" });
  const bad = (page: Page) => thread(page).getByRole("button", { name: "Bad answer" });

  test("a rating is set, changed and withdrawn", async ({ page }) => {
    const sent: unknown[] = [];
    // Like the server: the rating is kept, and the conversation is read back with it (it is
    // refetched once a rating has settled).
    let stored: "up" | "down" | null = null;
    await page.route(`**${MOCK}/conversations/c1`, (r) =>
      json(r, { ...conversation, documents: [], messages: [{ ...answeredMessage, answer: { ...answeredMessage.answer, rating: stored } }] }),
    );
    await page.route(`**${MOCK}/answers/a1/feedback`, (r) => {
      expect(r.request().method()).toBe("PUT");
      const body = r.request().postDataJSON() as { rating: "up" | "down" | null };
      sent.push(body.rating);
      stored = body.rating;
      return json(r, { answer_id: "a1", rating: body.rating });
    });
    await page.goto("/c/c1");
    await expect(thread(page).getByRole("group", { name: "Rate this answer" })).toBeVisible();
    await expect(good(page)).toHaveAttribute("aria-pressed", "false");
    await expect(bad(page)).toHaveAttribute("aria-pressed", "false");

    await good(page).click();
    await expect(good(page)).toHaveAttribute("aria-pressed", "true");
    await expect(bad(page)).toHaveAttribute("aria-pressed", "false");
    await bad(page).click();
    await expect(bad(page)).toHaveAttribute("aria-pressed", "true");
    await expect(good(page)).toHaveAttribute("aria-pressed", "false");
    await bad(page).click(); // pressing the pressed one withdraws it
    await expect(bad(page)).toHaveAttribute("aria-pressed", "false");
    await expect(good(page)).toHaveAttribute("aria-pressed", "false");

    await expect.poll(() => sent).toEqual(["up", "down", null]);
    await expectAccessible(page);
  });

  test("a stored rating is shown as pressed", async ({ page }) => {
    await withMessages(page, [{ ...answeredMessage, answer: { ...answeredMessage.answer, rating: "up" } }]);
    await page.goto("/c/c1");
    await expect(good(page)).toHaveAttribute("aria-pressed", "true");
    await expect(bad(page)).toHaveAttribute("aria-pressed", "false");
  });

  test("when the server refuses, the thumb goes back and the user is told", async ({ page }) => {
    await withMessages(page, [{ ...answeredMessage, answer: { ...answeredMessage.answer, rating: "up" } }]);
    await page.route(`**${MOCK}/answers/a1/feedback`, async (r) => {
      await new Promise((resolve) => setTimeout(resolve, 300)); // long enough to see the optimistic state
      await json(r, { detail: "answer not found" }, 404);
    });
    await page.goto("/c/c1");
    await expect(good(page)).toHaveAttribute("aria-pressed", "true");

    await bad(page).click();
    // Optimistic: the new rating is shown at once.
    await expect(bad(page)).toHaveAttribute("aria-pressed", "true");
    await expect(good(page)).toHaveAttribute("aria-pressed", "false");
    // Then the refusal puts the old one back.
    await expect(page.getByRole("status").filter({ hasText: "answer not found" })).toBeVisible();
    await expect(good(page)).toHaveAttribute("aria-pressed", "true");
    await expect(bad(page)).toHaveAttribute("aria-pressed", "false");
  });
});

test("Regenerate asks the same question again in the same conversation", async ({ page }) => {
  const asked: { question: string; conversation_id: string }[] = [];
  await page.route(`**${MOCK}/answers`, async (r) => {
    asked.push(r.request().postDataJSON());
    await r.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: sse(
        { type: "conversation", conversation_id: "c1", title: conversation.title, created: false },
        { type: "token", text: "A second attempt." },
        { type: "done", answer_id: "a2", refused: false, citations: [], uncited: true, stopped: false },
      ),
    });
  });
  await page.goto("/c/c1");
  await expect(thread(page).getByText("Who certifies batch release?")).toHaveCount(1);

  await thread(page).getByRole("button", { name: "Regenerate answer" }).click();
  await expect.poll(() => asked.length).toBe(1);
  expect(asked[0]).toMatchObject({ question: "Who certifies batch release?", conversation_id: "c1" });
  // The question appears again as a new turn, with its own answer.
  await expect(thread(page).getByText("Who certifies batch release?")).toHaveCount(2);
  await expect(thread(page).getByText("A second attempt.")).toBeVisible();
});

test("an example on the start screen fills the message box and does not send", async ({ page }) => {
  let sent = 0;
  await page.route(`**${MOCK}/answers`, (r) => {
    sent++;
    return r.abort();
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Quick assistance" })).toBeVisible();
  const box = page.getByRole("textbox", { name: "Message" });
  await box.fill("something typed earlier");

  const example = page.getByRole("button", { name: "Which deadlines and dates do the documents mention?" });
  await example.click();
  await expect(box).toHaveValue("Which deadlines and dates do the documents mention?");
  await expect(box).toBeFocused();
  await expect(page).toHaveURL(/\/$/);
  expect(sent).toBe(0);
  await expectAccessible(page);

  // The text can be edited before sending, and sending works as usual.
  await page.getByRole("button", { name: "What are the main conclusions of the report?" }).click();
  await expect(box).toHaveValue("What are the main conclusions of the report?");
});

test("turns of different days are separated by a labelled line", async ({ page }) => {
  const turn = (id: string, question: string, created_at: string) => ({
    ...answeredMessage,
    query_id: id,
    question,
    created_at,
    answer: { ...answeredMessage.answer, id: `a-${id}`, created_at },
  });
  const old = ago(5);
  await withMessages(page, [
    turn("q1", "Five days ago?", old),
    turn("q2", "Yesterday, first?", ago(1, 5)),
    turn("q3", "Yesterday, second?", ago(1)),
    turn("q4", "Today?", new Date().toISOString()),
  ]);
  await page.goto("/c/c1");
  await expect(thread(page).getByText("Today?")).toBeVisible();

  const date = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(old));
  const labels = thread(page).locator("li > div.text-muted");
  await expect(labels).toHaveText([date, "Yesterday", "Today"]);
  // Only the first turn of a day gets a line.
  await expect(thread(page).getByText("Yesterday", { exact: true })).toHaveCount(1);

  // Each side of a turn names its author and the time of day.
  const first = thread(page).locator("li").first();
  await expect(first.getByText("You", { exact: true })).toBeVisible();
  await expect(first.getByText("Response", { exact: true })).toBeVisible();
  await expect(first.locator("time")).toHaveText([/^\d{2}:\d{2}$/, /^\d{2}:\d{2}$/]);
  await expectAccessible(page);
});

test("a new question after a conversation last used yesterday starts a Today line", async ({ page }) => {
  // Last stored turn is from yesterday, so the live turn that follows gets a "Today" line.
  const created_at = ago(1);
  await withMessages(page, [
    { ...answeredMessage, created_at, answer: { ...answeredMessage.answer, created_at } },
  ]);
  await page.route(`**${MOCK}/answers`, (r) => r.fulfill({ status: 200, contentType: "text/event-stream", body: "" }));
  await page.goto("/c/c1");
  await expect(thread(page).getByText("Yesterday", { exact: true })).toBeVisible();

  await page.getByRole("textbox", { name: "Message" }).fill("And today?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(thread(page).getByText("Today", { exact: true })).toHaveCount(1);
});
