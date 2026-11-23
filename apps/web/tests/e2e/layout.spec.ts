import { expect, test, type Page } from "@playwright/test";
import { expectAccessible } from "./a11y";
import { answeredMessage, conversation, json, MOCK, mockApi, source } from "./mock-api";

const PAGES = [
  { path: "/", name: "start", ready: (p: Page) => p.getByRole("heading", { level: 1, name: "What do you want to know?" }) },
  { path: "/c/c1", name: "conversation", ready: (p: Page) => p.getByRole("heading", { level: 1, name: conversation.title }) },
  { path: "/g/g1", name: "group", ready: (p: Page) => p.getByRole("heading", { level: 1, name: "GxP" }) },
  { path: "/d/d1", name: "document", ready: (p: Page) => p.getByRole("heading", { level: 1, name: "annex11.pdf" }) },
  { path: "/search", name: "search lab", ready: (p: Page) => p.getByRole("heading", { level: 1, name: "Search lab" }) },
];

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

const overflow = (page: Page) =>
  page.evaluate(() => ({
    document: document.documentElement.scrollWidth - window.innerWidth,
    body: document.body.scrollWidth - window.innerWidth,
    main: document.getElementById("main")!.scrollWidth - document.getElementById("main")!.clientWidth,
  }));

test.describe("accessibility of every page", () => {
  for (const { path, name, ready } of PAGES) {
    for (const scheme of ["light", "dark"] as const) {
      test(`${name} page (${path}) in ${scheme} mode`, async ({ page }) => {
        // No colour transitions, so axe measures the final colours.
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
        await page.goto(path);
        await expect(ready(page)).toBeVisible();
        await expectAccessible(page);
      });
    }
  }

  for (const scheme of ["light", "dark"] as const) {
    test(`the sidebar lists in ${scheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto("/");
      const sidebar = page.getByRole("complementary", { name: "Sidebar" });
      for (const [name, heading] of [
        ["Groups", "My groups"],
        ["Documents", "My documents"],
        ["Chats", "My chats"],
      ]) {
        await sidebar.getByRole("button", { name }).click();
        await expect(sidebar.getByRole("heading", { name: heading })).toBeVisible();
        await expectAccessible(page);
      }
      await sidebar.getByRole("tab", { name: /Saved/ }).click();
      await expectAccessible(page);
    });
  }
});

test.describe("alignment on a desktop window", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the heading of the column is centred in the same 64px band as the bar of the page", async ({ page }) => {
    await page.goto("/");
    const column = page.getByRole("complementary", { name: "Sidebar" }).getByRole("heading", { level: 2, name: "My chats" });
    await expect(column).toBeVisible();
    const box = (await column.boundingBox())!;
    expect(box.y + box.height / 2).toBeCloseTo(32, 0);
  });

  test("messages and message box share one column", async ({ page }) => {
    await page.goto("/c/c1");
    const answer = page.getByText("Only Qualified Persons may certify batch release").first();
    await expect(answer).toBeVisible();
    const edges = await page.evaluate(() => {
      const left = (el: Element) => Math.round(el.getBoundingClientRect().left);
      const right = (el: Element) => Math.round(el.getBoundingClientRect().right);
      const avatar = document.querySelector('[aria-label="Messages"] li span[aria-hidden="true"]')!;
      const bubble = [...document.querySelectorAll('[aria-label="Messages"] li div[aria-busy], [aria-label="Messages"] li div.bg-bubble-ai')].pop()!;
      const box = document.querySelector("textarea")!.closest("div.rounded-lg")!;
      return { avatarLeft: left(avatar), bubbleLeft: left(bubble), bubbleRight: right(bubble), boxLeft: left(box), boxRight: right(box) };
    });
    // The avatars start the column, the bubbles and the box start 16px after them, all end together.
    expect(edges.bubbleLeft).toBe(edges.avatarLeft + 16);
    expect(edges.boxLeft).toBe(edges.bubbleLeft);
    expect(edges.boxRight).toBe(edges.bubbleRight);
  });

  for (const { path, name, ready } of PAGES) {
    test(`the bar of the ${name} page is 64px tall and starts at the top`, async ({ page }) => {
      await page.goto(path);
      const heading = ready(page);
      await expect(heading).toBeVisible();
      const bar = (await heading.locator("xpath=../..").boundingBox())!;
      expect({ y: bar.y, height: bar.height }).toEqual({ y: 0, height: 64 });
    });
  }
});

test.describe("phone, 320 px", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  for (const { path, name, ready } of PAGES) {
    test(`the ${name} page does not scroll sideways (${path})`, async ({ page }) => {
      await page.goto(path);
      await expect(ready(page)).toBeVisible();
      const o = await overflow(page);
      expect(o.document).toBeLessThanOrEqual(0);
      expect(o.body).toBeLessThanOrEqual(0);
      expect(o.main).toBeLessThanOrEqual(0);
    });
  }

  test("the drawer is out of reach while closed, and holds the focus while open", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    await expect(sidebar).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");

    // Walk the whole page with Tab: focus never lands in the closed drawer.
    const inDrawer: boolean[] = [];
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press("Tab");
      inDrawer.push(await page.evaluate(() => !!document.activeElement?.closest("#sidebar")));
    }
    expect(inDrawer).not.toContain(true);

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(sidebar).toBeVisible();
    await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "true");
    await expect(sidebar.getByRole("button", { name: "Close menu" })).toBeFocused();
    // The page behind it is inert while the drawer is open.
    expect(await page.evaluate(() => document.getElementById("main")!.closest("[inert]") !== null)).toBe(true);
    // The drawer fits the screen and offers every rail item.
    await expect.poll(async () => (await sidebar.boundingBox())!.x).toBe(0); // after it has slid in
    const box = (await sidebar.boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(320);
    for (const name of ["Chats", "Groups", "Documents", "Settings", "Switch to dark theme"]) {
      await expect(sidebar.getByRole("button", { name })).toBeVisible();
    }
    await expect(sidebar.getByRole("link", { name: "Search lab" })).toBeVisible();
    await expectAccessible(page);

    await page.keyboard.press("Escape");
    await expect(sidebar).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    // Closed again: unreachable again.
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("#sidebar"))).toBe(false);
  });

  test("choosing something in the drawer closes it", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.getByRole("complementary", { name: "Sidebar" });
    await page.getByRole("button", { name: "Open menu" }).click();
    await sidebar.getByRole("link", { name: /How are back-ups checked/ }).click();
    await expect(page).toHaveURL(/\/c\/c2$/);
    await expect(sidebar).toBeHidden();
  });
});

test.describe("sources panel below 1280 px", () => {
  const sources = [source, { ...source, n: 2, chunk_id: 8, page: 2, text: "Second excerpt." }];
  test.beforeEach(async ({ page }) => {
    await page.route(`**${MOCK}/conversations/c1`, (r) =>
      json(r, {
        ...conversation,
        documents: [],
        messages: [{ ...answeredMessage, answer: { ...answeredMessage.answer, text: "Fact one [1]. Fact two [2].", sources } }],
      }),
    );
  });

  for (const width of [1100, 820, 375]) {
    test(`at ${width} px it covers the page from the right and Escape closes it`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/c/c1");
      const citation = page.getByRole("button", { name: "Source 1: annex11.pdf, page 5" });
      await expect(citation).toBeVisible();
      await citation.click();

      const panel = page.getByRole("complementary", { name: "Sources" });
      await expect(panel).toBeVisible();
      await expect(panel.getByRole("heading", { level: 2, name: "Sources" })).toBeFocused();
      const box = (await panel.boundingBox())!;
      // An overlay: it sits against the right edge, over the page, and the page does not grow.
      expect(Math.round(box.x + box.width)).toBe(width);
      expect(box.height).toBe(800);
      expect(box.width).toBeLessThanOrEqual(width);
      expect((await overflow(page)).document).toBeLessThanOrEqual(0);
      // It is the topmost thing at its centre, so it can be clicked.
      expect(
        await page.evaluate(
          ([x, y]) => !!document.elementFromPoint(x, y)?.closest('aside[aria-labelledby]'),
          [box.x + box.width / 2, 400],
        ),
      ).toBe(true);
      await expectAccessible(page);

      await page.keyboard.press("Escape");
      await expect(panel).toBeHidden();
      await expect(page.getByRole("textbox", { name: "Message" })).toBeVisible();
    });
  }

  test("it closes with its button too, and from 1280 px it stands next to the chat instead", async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.goto("/c/c1");
    await page.getByRole("button", { name: "Source 1: annex11.pdf, page 5" }).click();
    const panel = page.getByRole("complementary", { name: "Sources" });
    await panel.getByRole("button", { name: "Close sources" }).click();
    await expect(panel).toBeHidden();

    await page.setViewportSize({ width: 1400, height: 800 });
    await page.getByRole("button", { name: "Source 1: annex11.pdf, page 5" }).click();
    await expect(panel).toBeVisible();
    const chat = (await page.getByRole("list", { name: "Messages" }).boundingBox())!;
    const side = (await panel.boundingBox())!;
    expect(chat.x + chat.width).toBeLessThanOrEqual(side.x + 1); // side by side, not over it
    await expect(page.getByRole("textbox", { name: "Message" })).toBeVisible();
  });
});
