import { expect, test, type Page } from "@playwright/test";
import { expectAccessible } from "./a11y";
import { answeredMessage, conversation, doc, json, MOCK, mockApi, source, sse } from "./mock-api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

/** The conversation itself; the same words also show in the sidebar card's preview. */
const messages = (page: Page) => page.getByRole("list", { name: "Messages" });

test("start page is accessible in light and dark mode", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "What do you want to know?" })).toBeVisible();
  // Groups are one rail click away; the column starts on the chats.
  await page.getByRole("complementary", { name: "Sidebar" }).getByRole("button", { name: "Groups" }).click();
  await expect(page.getByRole("link", { name: "GxP" })).toBeVisible();
  await expectAccessible(page);
  // Reduced motion turns off colour transitions, so axe measures the final dark colours rather
  // than a frame of the light-to-dark transition.
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await expectAccessible(page);
});

test("a question streams an answer with clickable citations", async ({ page }) => {
  let stored = false;
  await page.route(`**${MOCK}/conversations/c-new`, (r) =>
    json(r, {
      ...conversation,
      id: "c-new",
      group_id: null,
      documents: [],
      messages: stored ? [answeredMessage] : [],
    }),
  );
  await page.route(`**${MOCK}/answers`, async (r) => {
    expect(r.request().postDataJSON()).toMatchObject({ question: "Who certifies batch release?" });
    stored = true;
    await r.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: sse(
        { type: "conversation", conversation_id: "c-new", title: "Who certifies batch release?", created: true },
        { type: "sources", sources: [source] },
        { type: "token", text: "Only Qualified Persons may certify " },
        { type: "token", text: "batch release [1]." },
        { type: "done", answer_id: "a1", refused: false, citations: [1], uncited: false, stopped: false },
      ),
    });
  });

  await page.goto("/");
  const box = page.getByRole("textbox", { name: "Message" });
  await box.fill("Who certifies batch release?");
  await box.press("Enter");

  await expect(page).toHaveURL(/\/c\/c-new$/);
  await expect(messages(page).getByText("Only Qualified Persons may certify batch release")).toBeVisible();
  await page.getByRole("button", { name: "Source 1: annex11.pdf, page 5" }).click();

  const panel = page.getByRole("complementary", { name: "Sources" });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("link", { name: /Open PDF.*annex11\.pdf at page 5/ })).toHaveAttribute(
    "href",
    /\/documents\/d1\/file#page=5$/,
  );
  await expectAccessible(page);
});

test("deleting a group warns how many conversations go with it", async ({ page }) => {
  await page.goto("/g/g1");
  await page.getByRole("button", { name: "Delete group" }).click();

  const dialog = page.getByRole("dialog", { name: "Delete the group “GxP”?" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("This group has 3 conversations. All of them will be deleted too.");
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  await expectAccessible(page);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("the favourite limit is reported to the user", async ({ page }) => {
  await page.route(`**${MOCK}/conversations/c1`, (r) =>
    r.request().method() === "PATCH"
      ? json(r, { detail: "at most 10 favourite conversations are allowed" }, 409)
      : json(r, { ...conversation, documents: [], messages: [answeredMessage] }),
  );
  await page.goto("/c/c1");
  await page.getByRole("button", { name: "Add to favourites" }).click();
  await expect(page.getByRole("status").filter({ hasText: "at most 10 favourite conversations" })).toBeVisible();
});

test("sending waits until attached PDFs are indexed", async ({ page }) => {
  await page.route(`**${MOCK}/documents`, (r) =>
    r.request().method() === "POST"
      ? json(r, { ...doc, id: "d2", filename: "new.pdf", status: "processing", progress: 0, progress_total: null, duplicate: false }, 202)
      : json(r, [doc]),
  );
  let release: () => void = () => {};
  const indexed = new Promise<void>((resolve) => (release = resolve));
  await page.route(`**${MOCK}/documents/d2/events`, async (r) => {
    await indexed;
    await r.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: sse({ type: "status", document_id: "d2", status: "ready", progress: 3, progress_total: 3, error: null }),
    });
  });

  await page.goto("/");
  await page.getByRole("textbox", { name: "Message" }).fill("What is new?");
  await page.locator('input[type="file"]').setInputFiles({
    name: "new.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.7 test"),
  });

  const send = page.getByRole("button", { name: "Send" });
  await expect(page.getByText("Waiting for 1 file to be indexed…")).toBeVisible();
  await expect(send).toBeDisabled();
  release();
  await expect(page.getByRole("list", { name: "Attached files" })).toContainText("Ready");
  await expect(send).toBeEnabled();
});

test("works on a 320 px wide phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/c/c1");
  await expect(messages(page).getByText("Only Qualified Persons may certify batch release")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await expectAccessible(page);

  await page.getByRole("button", { name: "Open menu" }).click();
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  await expect(sidebar.getByRole("button", { name: "Close menu" })).toBeFocused();
  await sidebar.getByRole("button", { name: "Groups" }).click();
  await expect(sidebar.getByRole("link", { name: "GxP" })).toBeVisible();
  await expectAccessible(page);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
});

test("files attached to the first message are pinned to the new conversation", async ({ page }) => {
  await page.route(`**${MOCK}/documents`, (r) =>
    r.request().method() === "POST"
      ? json(r, { ...doc, id: "d2", filename: "manual.pdf", duplicate: false }, 202)
      : json(r, [doc, { ...doc, id: "d2", filename: "manual.pdf" }]),
  );
  let body: Record<string, unknown> | undefined;
  await page.route(`**${MOCK}/answers`, async (r) => {
    body = r.request().postDataJSON();
    await r.fulfill({ status: 200, contentType: "text/event-stream", body: "" });
  });

  await page.goto("/");
  await expect(page.getByRole("button", { name: "Searching all documents" })).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({
    name: "manual.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.7 manual"),
  });
  await expect(page.getByRole("button", { name: "Searching 1 selected document" })).toBeVisible();
  await page.getByRole("textbox", { name: "Message" }).fill("How do I connect it?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect.poll(() => body?.attached_document_ids).toEqual(["d2"]);
  // the file is shown above the question straight away
  const files = page.getByRole("list", { name: "Attached files" });
  await expect(files.getByRole("link", { name: /manual\.pdf/ })).toHaveAttribute("href", /\/documents\/d2\/file$/);
});

test("the scope of an existing conversation can be narrowed to chosen documents", async ({ page }) => {
  let pinned: string[] = [];
  await page.route(`**${MOCK}/conversations/c1/documents`, async (r) => {
    pinned = (r.request().postDataJSON() as { document_ids: string[] }).document_ids;
    await json(r, pinned.map((id) => ({ id, filename: "annex11.pdf", version: 1, status: "ready", active: true })));
  });
  await page.route(`**${MOCK}/conversations/c1`, (r) =>
    json(r, {
      ...conversation,
      documents: pinned.map((id) => ({ id, filename: "annex11.pdf", version: 1, status: "ready", active: true })),
      messages: [answeredMessage],
    }),
  );

  await page.goto("/c/c1");
  const dialog = page.getByRole("dialog", { name: "Which documents should be searched?" });
  await expect(dialog).toBeHidden(); // a closed dialog must not cover the page
  await page.getByRole("button", { name: "Searching group “GxP”" }).click();
  await expect(dialog).toContainText("Leave everything unchecked to search group “GxP”.");
  await expectAccessible(page);

  await dialog.getByRole("checkbox", { name: /annex11\.pdf/ }).check();
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => pinned).toEqual(["d1"]);
  await expect(page.getByRole("button", { name: "Searching 1 selected document" })).toBeVisible();
});

test("stored questions show the files that were attached to them", async ({ page }) => {
  await page.route(`**${MOCK}/conversations/c1`, (r) =>
    json(r, {
      ...conversation,
      documents: [],
      messages: [
        {
          ...answeredMessage,
          attachments: [
            { id: "d1", filename: "annex11.pdf", version: 1, status: "ready", active: true },
            { id: "d9", filename: "old.pdf", version: 1, status: "ready", active: false },
          ],
        },
      ],
    }),
  );
  await page.goto("/c/c1");
  const files = page.getByRole("list", { name: "Attached files" });
  await expect(files.getByRole("link", { name: /annex11\.pdf/ })).toBeVisible();
  await expect(files).toContainText("old.pdf");
  await expect(files.getByRole("link", { name: /old\.pdf/ })).toHaveCount(0); // removed: no link
  await expectAccessible(page);
});

test("the personal context is edited in Settings at the bottom of the sidebar", async ({ page }) => {
  let saved: string | undefined;
  await page.route(`**${MOCK}/settings`, async (r) => {
    if (r.request().method() === "PUT") {
      saved = (r.request().postDataJSON() as { personal_context: string }).personal_context;
      return json(r, { personal_context: saved, updated_at: new Date().toISOString() });
    }
    return json(r, { personal_context: "Answer briefly.", updated_at: null });
  });

  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: "Settings" });
  await expect(dialog).toBeHidden();
  await page.getByRole("complementary", { name: "Sidebar" }).getByRole("button", { name: "Settings" }).click();

  const field = dialog.getByRole("textbox", { name: "Personal context" });
  await expect(field).toHaveValue("Answer briefly.");
  await expectAccessible(page);

  await field.fill("Answer in Polish, as bullet points.");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect.poll(() => saved).toBe("Answer in Polish, as bullet points.");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("status").filter({ hasText: "Settings saved" })).toBeVisible();
});

test("the conversation being answered is highlighted in the sidebar", async ({ page }) => {
  let release: () => void = () => {};
  const answered = new Promise<void>((resolve) => (release = resolve));
  await page.route(`**${MOCK}/answers`, async (r) => {
    await answered;
    await r.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: sse(
        { type: "conversation", conversation_id: "c1", title: conversation.title, created: false },
        { type: "done", answer_id: "a2", refused: false, citations: [], uncited: true, stopped: false },
      ),
    });
  });

  await page.goto("/c/c1");
  await page.getByRole("textbox", { name: "Message" }).fill("And then?");
  await page.getByRole("button", { name: "Send" }).click();

  const recent = page.getByRole("complementary", { name: "Sidebar" }).getByRole("link", { name: /Who certifies batch release/ });
  await expect(recent).toHaveAttribute("aria-busy", "true");
  await expect(recent).toContainText("Answering…");
  await expect(recent).toHaveClass(/ai-active/);
  await expectAccessible(page);

  release();
  await expect(recent).not.toHaveAttribute("aria-busy", "true");
  await expect(recent).not.toHaveClass(/ai-active/);
});

test("the new group form can be cancelled", async ({ page }) => {
  await page.goto("/");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  await sidebar.getByRole("button", { name: "Groups" }).click();
  const add = sidebar.getByRole("button", { name: "New group" });
  const name = sidebar.getByRole("textbox", { name: "Group name" });

  await add.click();
  await name.fill("Draft");
  await sidebar.getByRole("button", { name: "Cancel" }).click();
  await expect(name).toBeHidden();
  await expect(add).toBeFocused();

  // Reopened empty; Escape closes it too.
  await add.click();
  await expect(name).toHaveValue("");
  await name.press("Escape");
  await expect(name).toBeHidden();
  await expect(add).toBeFocused();
});
