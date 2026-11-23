import { expect, test, type Page } from "@playwright/test";
import { expectAccessible } from "./a11y";
import { answeredMessage, conversation, json, MOCK, mockApi, source } from "./mock-api";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

/** Answers are held open (as if the model were still writing) until the test ends. */
async function holdAnswers(page: Page) {
  const asked: string[] = [];
  await page.route(`**${MOCK}/answers`, (r) => {
    asked.push((r.request().postDataJSON() as { conversation_id: string }).conversation_id);
  });
  return asked;
}

const sidebarLink = (page: Page, title: RegExp) =>
  page.getByRole("complementary", { name: "Sidebar" }).getByRole("link", { name: title });

test("two conversations can be answered at once, and Stop only stops its own", async ({ page }) => {
  const asked = await holdAnswers(page);

  await page.goto("/c/c1");
  await page.getByRole("textbox", { name: "Message" }).fill("First?");
  await page.getByRole("textbox", { name: "Message" }).press("Enter");
  await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();

  await sidebarLink(page, /How are back-ups checked/).click();
  await expect(page).toHaveURL(/\/c\/c2$/);
  // The other conversation's answer does not block this one.
  await page.getByRole("textbox", { name: "Message" }).fill("Second?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect.poll(() => asked).toEqual(["c1", "c2"]);

  const first = sidebarLink(page, /Who certifies batch release/);
  const second = sidebarLink(page, /How are back-ups checked/);
  await expect(first).toHaveAttribute("aria-busy", "true");
  await expect(second).toHaveAttribute("aria-busy", "true");

  await page.getByRole("button", { name: "Stop" }).click();
  await expect(second).not.toHaveAttribute("aria-busy", "true");
  await expect(first).toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();

  await first.click();
  await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
});

test("citations are superscripts at the end of their sentence, and only cited sources are counted", async ({
  page,
}) => {
  const other = { ...source, n: 2, chunk_id: 8, page: 2, text: "Unrelated excerpt." };
  await page.route(`**${MOCK}/conversations/c1`, (r) =>
    json(r, {
      ...conversation,
      documents: [],
      messages: [
        {
          ...answeredMessage,
          answer: {
            ...answeredMessage.answer,
            // The model put the citation first; it is shown at the end of the sentence.
            text: "[1] Only Qualified Persons may certify batch release.",
            sources: [source, other],
          },
        },
      ],
    }),
  );
  await page.goto("/c/c1");

  const answer = page.getByRole("list", { name: "Messages" }).locator("p", { hasText: "Only Qualified Persons" });
  await expect(answer).toHaveText("Only Qualified Persons may certify batch release[1].");
  const cite = answer.locator("sup").getByRole("button", { name: "Source 1: annex11.pdf, page 5" });
  await expect(cite).toHaveAttribute("title", "annex11.pdf, page 5");

  await page.getByRole("button", { name: "1 cited source" }).click();
  const panel = page.getByRole("complementary", { name: "Sources" });
  await expect(panel.getByRole("region", { name: "Cited in the answer" })).toContainText("Page 5");
  await expect(panel.getByRole("region", { name: "Searched, not cited" })).toContainText("Page 2");
  await expectAccessible(page);
});

test("switching between citations and closing the sources panel does not crash", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const other = { ...source, n: 2, chunk_id: 8, page: 2, text: "Second excerpt." };
  await page.route(`**${MOCK}/conversations/c1`, (r) =>
    json(r, {
      ...conversation,
      documents: [],
      messages: [
        {
          ...answeredMessage,
          answer: { ...answeredMessage.answer, text: "First fact [1]. Second fact [2].", sources: [source, other] },
        },
      ],
    }),
  );
  await page.goto("/c/c1");

  const panel = page.getByRole("complementary", { name: "Sources" });
  const current = panel.locator('article[aria-current="true"]');
  await page.getByRole("button", { name: "Source 1: annex11.pdf, page 5" }).click();
  await expect(current).toContainText("Page 5");
  await page.getByRole("button", { name: "Source 2: annex11.pdf, page 2" }).click();
  await expect(current).toContainText("Page 2");
  await panel.getByRole("button", { name: "Close sources" }).click();
  await expect(panel).toBeHidden();
  await expect(page.getByRole("textbox", { name: "Message" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("the chat and the sources panel scroll separately; the page itself does not", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  const sources = Array.from({ length: 8 }, (_, i) => ({
    ...source,
    n: i + 1,
    chunk_id: 100 + i,
    page: i + 1,
    text: `Excerpt ${i + 1}. ${"A long passage of text. ".repeat(120)}`,
  }));
  const messages = Array.from({ length: 10 }, (_, i) => ({
    ...answeredMessage,
    query_id: `q${i}`,
    question: `Question number ${i + 1}?`,
    answer: { ...answeredMessage.answer, id: `a${i}`, text: "Only Qualified Persons [1].", sources },
  }));
  await page.route(`**${MOCK}/conversations/c1`, (r) => json(r, { ...conversation, documents: [], messages }));
  await page.goto("/c/c1");
  await page.getByRole("button", { name: /^Source 1:/ }).first().click();

  const panel = page.getByRole("complementary", { name: "Sources" });
  await expect(panel).toBeVisible();

  // The page (<main>) never scrolls; the panel's list and the chat are the only scroll areas.
  const scroll = () =>
    page.evaluate(() => {
      const main = document.getElementById("main")!;
      const chat = document.querySelector('[aria-label="Messages"]')!.parentElement!;
      const aside = [...document.querySelectorAll("aside")].find((a) => a.querySelector("h2")?.textContent === "Sources")!;
      // The panel's bar stays where it is; the list under it is what scrolls.
      const sources = aside.querySelector("div.overflow-y-auto")!;
      return {
        mainOverflow: main.scrollHeight - main.clientHeight,
        // The document itself must never scroll (it would carry the sources panel away).
        documentOverflow: document.scrollingElement!.scrollHeight - innerHeight,
        windowY: scrollY,
        panelTop: aside.getBoundingClientRect().top,
        sourcesTitle: aside.querySelector("h2")!.getBoundingClientRect().top,
        chat: { top: chat.scrollTop, overflow: chat.scrollHeight - chat.clientHeight },
        sources: { top: sources.scrollTop, overflow: sources.scrollHeight - sources.clientHeight },
        panelHeight: aside.getBoundingClientRect().height,
        viewport: innerHeight,
      };
    });

  // Clicking the first citation scrolled the chat to the top; start from the middle.
  await page.evaluate(() => {
    document.querySelector('[aria-label="Messages"]')!.parentElement!.scrollTop = 600;
  });
  const before = await scroll();
  expect(before.chat.top).toBeGreaterThan(0);
  expect(before.mainOverflow).toBeLessThanOrEqual(1);
  expect(before.documentOverflow).toBeLessThanOrEqual(1);
  expect(before.panelHeight).toBeLessThanOrEqual(before.viewport);
  expect(before.sources.overflow).toBeGreaterThan(0);
  expect(before.chat.overflow).toBeGreaterThan(0);

  // Over a section heading: the quotes below it scroll on their own, so they would take the wheel.
  const heading = (await panel.getByRole("heading", { name: "Searched, not cited" }).boundingBox())!;
  await page.mouse.move(heading.x + heading.width / 2, heading.y + heading.height / 2);
  await page.mouse.wheel(0, 400);
  await expect.poll(async () => (await scroll()).sources.top).toBeGreaterThan(0);
  const afterPanel = await scroll();
  expect(afterPanel.chat.top).toBe(before.chat.top);
  expect(afterPanel.sourcesTitle).toBe(before.sourcesTitle); // the bar did not scroll away
  expect(afterPanel.mainOverflow).toBeLessThanOrEqual(1);

  // Over the chat (the sidebar takes the first 384px), not over the sources panel.
  await page.mouse.move(700, 300);
  await page.mouse.wheel(0, -400);
  await expect.poll(async () => (await scroll()).chat.top).toBeLessThan(before.chat.top);
  const afterChat = await scroll();
  expect(afterChat.sources.top).toBe(afterPanel.sources.top);
  expect(afterChat.mainOverflow).toBeLessThanOrEqual(1);

  // To the very bottom, and further: the page and the panel stay where they are.
  for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 1500);
  await expect.poll(async () => (await scroll()).chat.top).toBe(afterChat.chat.overflow);
  const atBottom = await scroll();
  expect(atBottom.windowY).toBe(0);
  expect(atBottom.documentOverflow).toBeLessThanOrEqual(1);
  expect(atBottom.panelTop).toBe(before.panelTop);
});

for (const grouped of [true, false]) {
  test(`the conversation bar and the sources bar line up (${grouped ? "with" : "without"} a group)`, async ({ page }) => {
    await page.route(`**${MOCK}/conversations/c1`, (r) =>
      json(r, { ...conversation, group_id: grouped ? conversation.group_id : null, documents: [], messages: [answeredMessage] }),
    );
    await page.goto("/c/c1");
    await expect(page.getByRole("heading", { level: 1, name: conversation.title })).toBeVisible();
    await page.getByRole("button", { name: /^Source 1:/ }).click();
    const panel = page.getByRole("complementary", { name: "Sources" });
    await expect(panel).toBeVisible();

    const bars = await page.evaluate(() => {
      // A heading sits in the bar's text block, which sits in the bar.
      const bar = (heading: Element) => heading.parentElement!.parentElement!;
      const edge = (el: Element) => {
        const r = el.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom };
      };
      const aside = [...document.querySelectorAll("aside")].find((a) => a.querySelector("h2")?.textContent === "Sources")!;
      const chatHeading = document.querySelector("main h1")!;
      const sourcesHeading = aside.querySelector("h2")!;
      return {
        conversation: edge(bar(chatHeading)),
        sources: edge(bar(sourcesHeading)),
        titles: { conversation: chatHeading.getBoundingClientRect().top, sources: sourcesHeading.getBoundingClientRect().top },
        height: bar(chatHeading).getBoundingClientRect().height,
      };
    });
    expect(bars.conversation.top).toBe(bars.sources.top);
    expect(bars.conversation.bottom).toBe(bars.sources.bottom);
    expect(bars.height).toBe(64);
    // The headings sit at the same height too, not only the lines under them: both bars have a
    // subtitle, whether it is the group of the conversation or its number of questions.
    expect(bars.titles.conversation).toBe(bars.titles.sources);
  });
}

test("the bar stays in view while the conversation scrolls under it, and does not cover it", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  const messages = Array.from({ length: 12 }, (_, i) => ({
    ...answeredMessage,
    query_id: `q${i}`,
    question: `Question number ${i + 1}?`,
    answer: { ...answeredMessage.answer, id: `a${i}`, text: "Only Qualified Persons [1]." },
  }));
  await page.route(`**${MOCK}/conversations/c1`, (r) => json(r, { ...conversation, documents: [], messages }));
  await page.goto("/c/c1");

  const heading = page.locator("main").getByRole("heading", { level: 1, name: conversation.title });
  const bar = heading.locator("xpath=../..");
  const first = page.getByText("Question number 1?");
  await expect(page.getByText("Question number 12?")).toBeVisible();
  // The chat opens at its end; go back to the top, where the first message must start below the bar.
  await page.evaluate(() => {
    document.querySelector('[aria-label="Messages"]')!.parentElement!.scrollTop = 0;
  });
  const barBox = (await bar.boundingBox())!;
  expect(barBox.y).toBe(0);
  expect((await first.boundingBox())!.y).toBeGreaterThanOrEqual(barBox.y + barBox.height);

  await page.mouse.move(700, 300);
  await page.mouse.wheel(0, 500);
  // The first message has scrolled out of sight (the panel clips it), the bar has not moved.
  await expect.poll(async () => (await first.boundingBox())!.y).toBeLessThan(barBox.y + barBox.height);
  await expect(first).not.toBeInViewport();
  await expect(heading).toBeInViewport({ ratio: 1 });
  expect(await bar.boundingBox()).toEqual(barBox);
  // An ordinary block, not an overlay: nothing paints over the messages from the bar.
  const style = await bar.evaluate((el) => {
    const css = getComputedStyle(el);
    return { position: css.position, blur: css.backdropFilter };
  });
  expect(style.position).toBe("static");
  expect(style.blur).toBe("none");
});
