import { expect, test } from "@playwright/test";
import { collectErrors } from "./helpers";

const TEXTS = {
  en: { h1: "Ask your PDFs. Check every answer.", tabs: ["All", "Chat", "Sources", "Documents", "Quality"], example: "Hand-written example" },
  pl: { h1: "Zapytaj swoje PDF-y. Sprawdź każdą odpowiedź.", tabs: ["Wszystko", "Czat", "Źródła", "Dokumenty", "Jakość"], example: "Przykład napisany ręcznie" },
} as const;

test.describe("home page", () => {
  test("has the hero: the h1, an eyebrow, and two links on", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(TEXTS.en.h1);
    const header = page.locator("main header").first();
    await expect(header.getByRole("link", { name: "View on GitHub" })).toHaveAttribute("href", "https://github.com/lukasz-malicki-wrx/hybrid-rag");
    await expect(header.getByRole("link", { name: "How it works" })).toHaveAttribute("href", "/en/how-it-works");
    expect(errors).toEqual([]);
  });

  test("puts the picture before the text on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/en");
    const picture = await page.locator("main header [role='img'], main header .screenshot").first().boundingBox();
    const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
    expect(picture && heading && picture.y < heading.y).toBe(true);
  });

  test("lists what it is built with, four items", async ({ page }) => {
    await page.goto("/en");
    const list = page.getByRole("list", { name: "Built with" });
    await expect(list.getByRole("listitem")).toHaveText(["PostgreSQL + pgvector", "Ollama", "FastAPI", "Next.js"]);
  });

  test("has four strengths, each with its own link", async ({ page }) => {
    await page.goto("/pl");
    const section = page.getByRole("region", { name: "Co dostajesz" });
    await expect(section.getByRole("heading", { level: 3 })).toHaveCount(4);
    const hrefs = await section.getByRole("link").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(hrefs).toEqual(["/pl/features#sources", "/pl/how-it-works#hiw-gate", "/pl/privacy", "/pl/how-it-works#hiw-search"]);
  });

  test("shows the measured numbers with the method and a link to it", async ({ page }) => {
    await page.goto("/en");
    const terms = page.locator("dl dt");
    await expect(terms).toHaveCount(4);
    await expect(page.locator("dl dd")).toHaveText(["44", "100%", "10/10", "122"]);
    await expect(page.getByText("Only the search step was measured")).toBeVisible();
    await expect(page.getByRole("link", { name: "Full method and tables on GitHub" })).toHaveAttribute("href", /\/docs\/EVALUATION\.md$/);
  });

  for (const locale of ["en", "pl"] as const) {
    test(`filters the gallery with tabs (${locale}) and keeps the page height`, async ({ page }) => {
      await page.goto(`/${locale}`);
      const { tabs } = TEXTS[locale];
      const tablist = page.getByRole("tablist");
      await expect(tablist.getByRole("tab")).toHaveText(tabs);
      const panel = page.getByRole("tabpanel");
      const cards = panel.getByRole("listitem");
      await expect(cards).toHaveCount(6);
      const height = () => page.evaluate(() => document.documentElement.scrollHeight);
      const before = await height();

      await tablist.getByRole("tab", { name: tabs[1] }).click();
      await expect(cards).toHaveCount(2);
      await expect(panel).toHaveAccessibleName(tabs[1]);
      await tablist.getByRole("tab", { name: tabs[3] }).click();
      await expect(cards).toHaveCount(1);
      expect(await height()).toBe(before);

      // Arrow keys move the selection and the focus (automatic activation).
      await page.keyboard.press("ArrowRight");
      await expect(tablist.getByRole("tab", { name: tabs[4] })).toBeFocused();
      await expect(cards).toHaveCount(2);
      await tablist.getByRole("tab", { name: tabs[0] }).click();
      await expect(cards).toHaveCount(6);
      expect(await height()).toBe(before);
    });
  }

  test("shows all six gallery cards without script", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await context.newPage();
    await page.goto("/en");
    await expect(page.getByRole("tabpanel").getByRole("listitem")).toHaveCount(6);
    await context.close();
  });

  for (const locale of ["en", "pl"] as const) {
    test(`shows two hand-written example answers, one cited and one refusal (${locale})`, async ({ page }) => {
      await page.goto(`/${locale}`);
      const section = page.getByRole("region", { name: locale === "en" ? "What an answer looks like" : "Jak wygląda odpowiedź" });
      await expect(section.getByRole("listitem")).toHaveCount(2);
      await expect(section.getByText(TEXTS[locale].example)).toHaveCount(2);
      await expect(section.getByText(/eu-gmp-annex11\.pdf/)).toHaveCount(1);
    });
  }

  test("links to GitHub, how it works, the features and the evaluation", async ({ page }) => {
    await page.goto("/pl");
    const hrefs = await page.locator("main a").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    for (const expected of ["/pl/how-it-works", "/pl/features", "/pl/features#sources", "/pl/features#quality", "/pl/privacy"]) {
      expect(hrefs).toContain(expected);
    }
    expect(hrefs.some((h) => h?.endsWith("/docs/EVALUATION.md"))).toBe(true);
    expect(hrefs.some((h) => h === "https://github.com/lukasz-malicki-wrx/hybrid-rag")).toBe(true);
  });

  test("has SoftwareApplication structured data without offers or ratings", async ({ page }) => {
    await page.goto("/en");
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const app = scripts.map((s) => JSON.parse(s)).find((d) => d["@type"] === "SoftwareApplication");
    expect(app?.name).toBe("hybrid-rag");
    expect(app).not.toHaveProperty("offers");
    expect(app).not.toHaveProperty("aggregateRating");
  });

  test("has exactly one h1 and every section is named", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("h1")).toHaveCount(1);
    const unnamed = await page.locator("main section").evaluateAll((els) => els.filter((el) => !el.getAttribute("aria-labelledby")).length);
    expect(unnamed).toBe(0);
  });
});
