import { expect, test } from "@playwright/test";
import { LOCALES, pathOf } from "./helpers";

// The one statement of what the prompt holds when the Claude API writes the answer. It must be the
// same, complete, on every page that says what is sent (apps/api/app/rag/prompt.py is the truth).
const STATEMENT = {
  en: "the last 3 turns of the conversation, your personal context from Settings and the excerpts found in your documents, with their file names and page numbers",
  pl: "3 ostatnie tury rozmowy, Twój kontekst osobisty z ustawień oraz fragmenty znalezione w dokumentach, razem z nazwami plików i numerami stron",
} as const;

for (const locale of LOCALES) {
  test(`${locale}: privacy, FAQ and how it works say the same about what is sent to Anthropic`, async ({ page }) => {
    for (const slug of ["privacy", "faq", "how-it-works"]) {
      await page.goto(pathOf(locale, slug));
      // textContent: the FAQ answers are in closed <details>.
      const text = ((await page.locator("main").textContent()) ?? "").replace(/[ \s]+/g, " ");
      expect(text, slug).toContain(STATEMENT[locale]);
    }
  });
}
