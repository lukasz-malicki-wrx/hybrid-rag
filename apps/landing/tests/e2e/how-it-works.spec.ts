import { expect, test } from "@playwright/test";
import { LOCALES, pathOf } from "./helpers";

const TEXTS = {
  en: { ingest: "Flow 1: from PDF to searchable", ask: "Flow 2: from question to cited answer", start: "Terminal command: start hybrid-rag", seed: "Terminal command: load the sample documents" },
  pl: { ingest: "Przebieg 1: od PDF-a do przeszukiwalnego dokumentu", ask: "Przebieg 2: od pytania do odpowiedzi z cytatami", start: "Polecenie w terminalu: uruchomienie hybrid-rag", seed: "Polecenie w terminalu: wgranie przykładowych dokumentów" },
} as const;

for (const locale of LOCALES) {
  test.describe(`how it works (${locale})`, () => {
    const path = pathOf(locale, "how-it-works");
    const texts = TEXTS[locale];

    test("shows both flows as ordered lists of steps, readable as text", async ({ page }) => {
      await page.goto(path);
      const ingest = page.getByRole("figure").filter({ hasText: texts.ingest });
      const ask = page.getByRole("figure").filter({ hasText: texts.ask });
      await expect(ingest.getByRole("listitem")).toHaveCount(4);
      await expect(ask.getByRole("listitem")).toHaveCount(6);
      // Each step names itself for a screen reader even where the list numbering is hidden.
      await expect(ingest.getByRole("listitem").first()).toContainText(locale === "en" ? "Step 1" : "Krok 1");
    });

    test("keeps the diagram inside a 320px screen, one step under the other", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 });
      await page.goto(path);
      const steps = page.getByRole("figure").filter({ hasText: texts.ask }).getByRole("listitem");
      const boxes = await steps.evaluateAll((els) => els.map((el) => el.getBoundingClientRect()));
      for (const box of boxes) {
        expect(box.left).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(320);
      }
      expect(new Set(boxes.map((b) => Math.round(b.left))).size).toBe(1);
    });

    test("keeps the boxes of the diagram in forced-colors mode", async ({ page }) => {
      await page.emulateMedia({ forcedColors: "active" });
      await page.goto(path);
      const step = page.getByRole("figure").filter({ hasText: texts.ingest }).getByRole("listitem").first();
      expect(await step.evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth))).toBeGreaterThan(0);
      const button = page.getByRole("main").getByRole("link", { name: /GitHub/ });
      expect(await button.evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth))).toBeGreaterThan(0);
    });

    test("works through the example of rank fusion with the real formula and its numbers", async ({ page }) => {
      await page.goto(path);
      await expect(page.getByText(/1 \/ \(60 \+ (position|miejsce)\)/)).toBeVisible();
      const table = page.getByRole("table");
      const rows = table.getByRole("row");
      await expect(rows).toHaveCount(5); // the header and four chunks
      const decimal = locale === "en" ? "." : ",";
      const cells = async (index: number) => rows.nth(index).getByRole("cell").allTextContents();
      // A: 1/61 + 1/63; B: 1/62 (only one list); C: 1/64 + 1/62; D: 1/67 + 1/61.
      expect(await cells(1)).toEqual(["1", "3", `0${decimal}0323`, "1"]);
      const absent = locale === "en" ? "not in this list" : "nie ma go na tej liście";
      expect(await cells(2)).toEqual(["2", `\u2013${absent}`, `0${decimal}0161`, "4"]);
      expect(await cells(3)).toEqual(["4", "2", `0${decimal}0318`, "2"]);
      expect(await cells(4)).toEqual(["7", "1", `0${decimal}0313`, "3"]);
      // A chunk that is in only one list says so for a screen reader: the dash is decoration, the words are there.
      await expect(rows.nth(2).getByRole("cell").nth(1)).toContainText(absent);
    });

    test("has the real commands in labelled, selectable, focusable blocks", async ({ page }) => {
      await page.goto(path);
      const start = page.getByRole("figure", { name: texts.start });
      await expect(start.locator("pre")).toHaveText("docker compose up -d --build");
      await expect(page.getByRole("figure", { name: texts.seed }).locator("pre")).toHaveText("./scripts/seed_samples.sh");
      expect(await start.locator("pre").evaluate((el) => getComputedStyle(el).userSelect)).not.toBe("none");
      await start.focus();
      await expect(start).toBeFocused();
    });

    test("shows the document and search-lab screenshot slots and links to the repository docs", async ({ page }) => {
      await page.goto(path);
      const main = page.getByRole("main");
      for (const description of [
        locale === "en" ? "A document page with the chunks" : "Strona dokumentu z fragmentami",
        locale === "en" ? "The search lab" : "Laboratorium wyszukiwania",
      ]) {
        await expect(main.getByRole("img", { name: new RegExp(description) })).toBeVisible();
      }
      for (const file of ["README.md", "docs/HOW_IT_WORKS.md", "docs/EVALUATION.md"]) {
        await expect(main.locator(`a[href$="/blob/main/${file}"]`)).toHaveCount(1);
      }
    });
  });
}
