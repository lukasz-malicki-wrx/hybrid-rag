import { expect, test, type Page } from "@playwright/test";
import { expectAccessible } from "./a11y";
import { ago, conversation, conversation2, mockApi } from "./mock-api";

const chats = [
  { ...conversation, group_id: null, updated_at: new Date().toISOString() },
  { ...conversation2, favorite: true, updated_at: ago(1) },
  {
    ...conversation,
    id: "c3",
    group_id: null,
    title: "Zażółć gęślą jaźń",
    preview: "Pytanie o polskie znaki w nazwach.",
    updated_at: ago(3),
  },
  { ...conversation, id: "c4", group_id: null, title: "Old question", preview: null, updated_at: ago(40) },
];

const sidebar = (page: Page) => page.getByRole("complementary", { name: "Sidebar" });
const rail = (page: Page, name: string) => sidebar(page).getByRole("button", { name });
const column = (page: Page, heading: string) => sidebar(page).getByRole("heading", { level: 2, name: heading });

test.beforeEach(async ({ page }) => {
  await mockApi(page, { conversations: chats });
});

test.describe("rail and column", () => {
  test("the rail picks which list the column shows, without leaving the page", async ({ page }) => {
    await page.goto("/");
    await expect(column(page, "My chats")).toBeVisible();
    await expect(rail(page, "Chats")).toHaveAttribute("aria-pressed", "true");

    await rail(page, "Groups").click();
    await expect(column(page, "My groups")).toBeVisible();
    await expect(sidebar(page).getByRole("link", { name: /GxP/ })).toBeVisible();
    await expect(rail(page, "Groups")).toHaveAttribute("aria-pressed", "true");
    await expect(rail(page, "Chats")).toHaveAttribute("aria-pressed", "false");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "What do you want to know?" })).toBeVisible();

    await rail(page, "Documents").click();
    await expect(column(page, "My documents")).toBeVisible();
    await expect(sidebar(page).getByRole("link", { name: "annex11.pdf" })).toBeVisible();
    await expect(rail(page, "Documents")).toHaveAttribute("aria-pressed", "true");

    await rail(page, "Chats").click();
    await expect(column(page, "My chats")).toBeVisible();
    await expectAccessible(page);
  });

  test("the section follows the route, and a chosen section stays until the route changes", async ({ page }) => {
    await page.goto("/g/g1");
    await expect(column(page, "My groups")).toBeVisible();
    await expect(rail(page, "Groups")).toHaveAttribute("aria-pressed", "true");
    await expect(sidebar(page).getByRole("link", { name: /GxP/ })).toHaveAttribute("aria-current", "page");

    await page.goto("/d/d1");
    await expect(column(page, "My documents")).toBeVisible();
    await expect(rail(page, "Documents")).toHaveAttribute("aria-pressed", "true");

    await page.goto("/c/c1");
    await expect(column(page, "My chats")).toBeVisible();
    await expect(rail(page, "Chats")).toHaveAttribute("aria-pressed", "true");
    await expect(sidebar(page).getByRole("link", { name: /Who certifies batch release/ })).toHaveAttribute(
      "aria-current",
      "page",
    );

    // Looking at another list does not navigate; opening something from it does, and the rail follows.
    await rail(page, "Groups").click();
    await expect(page).toHaveURL(/\/c\/c1$/);
    await sidebar(page).getByRole("link", { name: /GxP/ }).click();
    await expect(page).toHaveURL(/\/g\/g1$/);
    await expect(rail(page, "Groups")).toHaveAttribute("aria-pressed", "true");

    await rail(page, "Documents").click();
    await sidebar(page).getByRole("link", { name: "annex11.pdf" }).click();
    await expect(page).toHaveURL(/\/d\/d1$/);
    await expect(rail(page, "Documents")).toHaveAttribute("aria-pressed", "true");
  });

  test("the search lab is its own rail item", async ({ page }) => {
    await page.goto("/search");
    const lab = sidebar(page).getByRole("link", { name: "Search lab" });
    await expect(lab).toHaveAttribute("aria-current", "page");
    for (const name of ["Chats", "Groups", "Documents"]) {
      await expect(rail(page, name)).toHaveAttribute("aria-pressed", "false");
    }
    // The column keeps a list, and the rail can still pick another one.
    await rail(page, "Documents").click();
    await expect(column(page, "My documents")).toBeVisible();
    await expect(rail(page, "Documents")).toHaveAttribute("aria-pressed", "true");
    await expect(lab).not.toHaveAttribute("aria-current", "page");
    await expect(page).toHaveURL(/\/search$/);

    await page.goto("/");
    await sidebar(page).getByRole("link", { name: "Search lab" }).click();
    await expect(page).toHaveURL(/\/search$/);
    await expect(page.getByRole("heading", { level: 1, name: "Search lab" })).toBeVisible();
  });

  test("a section picked on the search lab does not outlive the next navigation", async ({ page }) => {
    await page.goto("/search");
    await rail(page, "Groups").click();
    await expect(rail(page, "Groups")).toHaveAttribute("aria-pressed", "true");

    // Client-side navigation keeps the page's state, which is where a stale pick would hide.
    await rail(page, "Chats").click();
    await sidebar(page).getByRole("link", { name: /Who certifies batch release/ }).click();
    await expect(page).toHaveURL(/\/c\/c1$/);
    await expect(rail(page, "Chats")).toHaveAttribute("aria-pressed", "true");
    await page.goBack();
    await expect(page).toHaveURL(/\/search$/);
    await expect(sidebar(page).getByRole("link", { name: "Search lab" })).toHaveAttribute("aria-current", "page");
    await expect(rail(page, "Groups")).toHaveAttribute("aria-pressed", "false");
  });
});

test.describe("chat cards", () => {
  test("each card shows the title, the time and the start of the latest answer", async ({ page }) => {
    await page.goto("/");
    const list = sidebar(page).getByRole("tabpanel", { name: "Chats" });
    const card = (title: RegExp) => list.getByRole("link", { name: title });

    const first = card(/Who certifies batch release/);
    await expect(first).toContainText("Only Qualified Persons may certify batch release [1].");
    // Today: the hour. Within a week: the weekday. Older: the date.
    await expect(first.locator("time")).toHaveText(/^\d{2}:\d{2}$/);
    await expect(card(/Zażółć/).locator("time")).toHaveText(/^[A-Z][a-z]{2}$/);
    await expect(card(/Old question/).locator("time")).toHaveText(/^(\d{1,2} [A-Z][a-z]{2}|[A-Z][a-z]{2} \d{1,2})(,? \d{4})?$/);
    // A conversation with no answer says so instead of leaving a gap.
    await expect(card(/Old question/)).toContainText("No answer yet");
    await expect(card(/Zażółć/)).toContainText("Pytanie o polskie znaki w nazwach.");
  });

  test("the Saved tab lists the favourites and counts them", async ({ page }) => {
    await page.goto("/");
    const tabs = sidebar(page).getByRole("tablist", { name: "Show chats" });
    const all = tabs.getByRole("tab", { name: /Chats/ });
    const saved = tabs.getByRole("tab", { name: /Saved/ });
    await expect(all).toHaveAttribute("aria-selected", "true");
    await expect(all).toContainText("4");
    await expect(saved).toContainText("1");

    await saved.click();
    await expect(saved).toHaveAttribute("aria-selected", "true");
    const panel = sidebar(page).getByRole("tabpanel", { name: "Saved" });
    await expect(panel.getByRole("link")).toHaveCount(1);
    await expect(panel.getByRole("link", { name: /How are back-ups checked/ })).toBeVisible();
    await expect(sidebar(page).getByRole("link", { name: /Who certifies batch release/ })).toHaveCount(0);
    await expectAccessible(page);

    // Arrow keys move between the tabs (automatic activation), as for any tab list.
    await saved.press("ArrowLeft");
    await expect(all).toHaveAttribute("aria-selected", "true");
    await expect(all).toBeFocused();
    await expect(sidebar(page).getByRole("link", { name: /Who certifies batch release/ })).toBeVisible();
  });

  test("the Saved tab explains when nothing is saved", async ({ page }) => {
    await mockApi(page); // no favourites
    await page.goto("/");
    await sidebar(page).getByRole("tab", { name: /Saved/ }).click();
    await expect(sidebar(page).getByText("No saved chats yet. Star a chat to keep it here.")).toBeVisible();
  });

  test("the search box filters the cards by title, ignoring case and accents", async ({ page }) => {
    await page.goto("/");
    const search = sidebar(page).getByRole("searchbox", { name: "Search chats" });
    const links = sidebar(page).getByRole("tabpanel").getByRole("link");
    await expect(links).toHaveCount(4);

    await search.fill("ZAZOLC");
    await expect(links).toHaveCount(1);
    await expect(links.first()).toContainText("Zażółć gęślą jaźń");

    await search.fill("back-ups");
    await expect(links).toHaveCount(1);
    await expect(links.first()).toContainText("How are back-ups checked?");

    await search.fill("nothing like this");
    await expect(links).toHaveCount(0);
    await expect(sidebar(page).getByText("Nothing matches “nothing like this”.")).toBeVisible();
    await expectAccessible(page);

    await search.fill("");
    await expect(links).toHaveCount(4);
  });

  test("the group and document lists can be filtered too", async ({ page }) => {
    await page.goto("/");
    await rail(page, "Groups").click();
    const groups = sidebar(page).getByRole("searchbox", { name: "Search groups" });
    await groups.fill("gx");
    await expect(sidebar(page).getByRole("link", { name: /GxP/ })).toBeVisible();
    await groups.fill("zzz");
    await expect(sidebar(page).getByText("Nothing matches “zzz”.")).toBeVisible();

    await rail(page, "Documents").click();
    const documents = sidebar(page).getByRole("searchbox", { name: "Search documents" });
    await documents.fill("annex");
    await expect(sidebar(page).getByRole("link", { name: "annex11.pdf" })).toBeVisible();
    await documents.fill("manual");
    await expect(sidebar(page).getByText("Nothing matches “manual”.")).toBeVisible();
  });
});
