import { expect, test } from "@playwright/test";
import { expectAccessible } from "./a11y";
import { json, MOCK, mockApi } from "./mock-api";

const hit = (id: number, vector: number | null, fulltext: number | null) => ({
  id,
  document_id: "d1",
  filename: "annex11.pdf",
  version: 1,
  page: id,
  position: 0,
  text: `Chunk ${id} text about batch release.`,
  distance: vector === null ? null : 0.31,
  score: 0.0328,
  vector_rank: vector,
  fulltext_rank: fulltext,
});

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("a document page shows its chunks, their sizes and a text filter", async ({ page }) => {
  await page.goto("/d/d1");
  await expect(page.getByRole("heading", { level: 1, name: "annex11.pdf" })).toBeVisible();
  await expect(page.getByText("3 of 3 chunks shown")).toBeVisible();
  // One of three chunks is under 200 characters and is flagged.
  await expect(page.getByText("Short", { exact: true })).toHaveCount(1);
  await expectAccessible(page);

  await page.getByLabel("Find in chunks").fill("qualified");
  await expect(page.getByText("1 of 3 chunks shown")).toBeVisible();
  await expect(page.getByText("Qualified Persons certify batch release.")).toBeVisible();
  await expect(page.getByText("Cover page of the annex.").first()).toBeHidden();
  // The searched text is marked in the chunk, whatever its case in the document.
  await expect(page.locator("mark")).toHaveText(["Qualified"]);
});

test("a sidebar document opens its chunks, not the PDF", async ({ page }) => {
  await page.goto("/");
  const sidebar = page.getByRole("complementary", { name: "Sidebar" });
  await sidebar.getByRole("button", { name: "Documents" }).click();
  await sidebar.getByRole("link", { name: "annex11.pdf" }).click();
  await expect(page).toHaveURL(/\/d\/d1$/);
});

test("the search lab shows where each method ranked a chunk", async ({ page }) => {
  await page.route(`**${MOCK}/search`, (r) => {
    expect(r.request().postDataJSON()).toMatchObject({ question: "batch release", mode: "hybrid", k: 8 });
    return json(r, [hit(2, 1, 1), hit(3, 4, null), hit(1, null, 2)]);
  });
  await page.goto("/");
  await page.getByRole("link", { name: "Search lab" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Search lab" })).toBeVisible();
  await expectAccessible(page);

  await page.getByLabel("Question").fill("batch release");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("heading", { name: "3 results" })).toBeVisible();
  await expect(page.getByText("Vector #1 (distance 0.310)")).toBeVisible();
  await expect(page.getByText("Not in full-text results")).toBeVisible();
  await expect(page.getByText("Not in vector results")).toBeVisible();
  await expectAccessible(page);

  await page.getByRole("link", { name: /annex11.pdf, Page 3/ }).click();
  await expect(page).toHaveURL(/\/d\/d1#chunk-3$/);
});

test("the search lab explains an empty result", async ({ page }) => {
  await page.route(`**${MOCK}/search`, (r) => json(r, []));
  await page.goto("/search");
  await page.getByLabel("Question").fill("unrelated");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText(/Nothing relevant/)).toBeVisible();
});
