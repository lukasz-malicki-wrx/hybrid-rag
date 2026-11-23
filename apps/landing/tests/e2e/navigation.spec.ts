import { expect, test, type Page } from "@playwright/test";
import { brightness, collectErrors } from "./helpers";

test.describe("the root address", () => {
  test("redirects with 307 by Accept-Language, English by default", async ({ request }) => {
    const redirect = (acceptLanguage?: string) =>
      request.get("/", { maxRedirects: 0, headers: acceptLanguage ? { "Accept-Language": acceptLanguage } : {} });
    for (const [header, target] of [
      ["pl-PL,pl;q=0.9,en;q=0.5", "/pl"],
      ["en-US,en;q=0.9", "/en"],
      ["de,fr;q=0.8", "/en"],
      ["pl;q=0.2,en;q=0.9", "/en"],
      [undefined, "/en"],
    ] as const) {
      const response = await redirect(header);
      expect(response.status(), String(header)).toBe(307);
      expect(new URL(response.headers().location ?? "", "http://x").pathname, String(header)).toBe(target);
      expect(response.headers().vary).toContain("Accept-Language");
    }
  });
});

test.describe("language switch", () => {
  test("goes to the same page in the other language, and back", async ({ page }) => {
    await page.goto("/en/pricing");
    await page.getByRole("link", { name: "Polski" }).first().click();
    await expect(page).toHaveURL(/\/pl\/pricing$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "pl");
    await page.getByRole("link", { name: "English" }).first().click();
    await expect(page).toHaveURL(/\/en\/pricing$/);
  });

  test("marks the language of its own text", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("link", { name: "Polski" }).first()).toHaveAttribute("lang", "pl");
  });
});

test.describe("navigation", () => {
  test("marks the current page with aria-current", async ({ page }) => {
    await page.goto("/en/pricing");
    await expect(page.getByRole("navigation", { name: "Main", exact: true }).locator('a[aria-current="page"]')).toHaveText("Pricing");
    await page.goto("/pl/about");
    await expect(page.getByRole("navigation", { name: "Główna", exact: true }).locator('a[aria-current="page"]')).toHaveText("O projekcie");
  });

  test("marks the Product menu, and the page inside it, when the current page is one of its pages", async ({ page }) => {
    await page.goto("/en/faq");
    const nav = page.getByRole("navigation", { name: "Main", exact: true });
    await expect(nav.locator("summary")).toHaveAttribute("aria-current", "true");
    await nav.locator("summary").click();
    await expect(nav.locator('a[aria-current="page"]')).toHaveText("FAQ");
    await page.goto("/pl/how-it-works");
    await expect(page.getByRole("navigation", { name: "Główna", exact: true }).locator("summary")).toHaveAttribute("aria-current", "true");
    await page.goto("/en/pricing");
    await expect(nav.locator("summary")).not.toHaveAttribute("aria-current", /.*/);
  });

  test("the footer lists every page, GitHub, LinkedIn, the licence and the author", async ({ page }) => {
    await page.goto("/en");
    const footer = page.getByRole("contentinfo");
    for (const name of ["Home", "Features", "How it works", "Pricing", "FAQ", "About", "Privacy", "Accessibility"]) {
      await expect(footer.getByRole("link", { name, exact: true })).toBeVisible();
    }
    await expect(footer.getByRole("link", { name: "Source on GitHub" })).toHaveAttribute("href", /github\.com\/lukasz-malicki-wrx\/hybrid-rag$/);
    await expect(footer.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", "https://www.linkedin.com/in/qweluke");
    await expect(footer.getByRole("link", { name: "MIT licence" })).toBeVisible();
    await expect(footer).toContainText("Lukasz Malicki");
  });

  test("no link opens a new tab", async ({ page }) => {
    await page.goto("/en");
    expect(await page.locator('a[target="_blank"]').count()).toBe(0);
  });
});

test.describe("skip link", () => {
  test("is the first stop of the keyboard and moves focus to the main content", async ({ page }) => {
    await page.goto("/en");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main")).toBeFocused();
  });
});

test.describe("Product menu", () => {
  const summary = (page: Page) => page.getByRole("navigation", { name: "Main", exact: true }).locator("summary");
  const links = (page: Page) => page.getByRole("navigation", { name: "Main", exact: true }).locator("details a");

  test("opens with the keyboard, lists its pages, moves focus into the list and closes with Escape back to its button", async ({ page }) => {
    await page.goto("/en");
    await summary(page).focus();
    await expect(links(page).first()).toBeHidden();
    await page.keyboard.press("Enter");
    await expect(links(page)).toHaveText(["Features", "How it works", "FAQ"]);
    await page.keyboard.press("Tab");
    await expect(links(page).first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(links(page).first()).toBeHidden();
    await expect(summary(page)).toBeFocused();
  });

  test("closes on a click outside, on focus leaving it and after following a link", async ({ page }) => {
    await page.goto("/en");
    await summary(page).click();
    await expect(links(page).first()).toBeVisible();
    await page.mouse.click(700, 600);
    await expect(links(page).first()).toBeHidden();
    await summary(page).click();
    await page.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name: "Pricing" }).focus();
    await expect(links(page).first()).toBeHidden();
    await summary(page).click();
    await links(page).nth(1).click();
    await expect(page).toHaveURL(/\/en\/how-it-works$/);
    await expect(links(page).first()).toBeHidden();
  });

  test("closes after a link to the page that is already open", async ({ page }) => {
    await page.goto("/en/features");
    await summary(page).click();
    await links(page).first().click();
    await expect(links(page).first()).toBeHidden();
  });

  test("works without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en");
    await summary(page).click();
    await expect(links(page)).toHaveText(["Features", "How it works", "FAQ"]);
    await context.close();
  });

  test("is a soft-shadowed list below the bar, over the page", async ({ page }) => {
    await page.goto("/en");
    await summary(page).click();
    const header = await page.getByRole("banner").boundingBox();
    const list = await page.locator("nav details ul").boundingBox();
    expect(list?.y ?? 0).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0) - 1);
    expect(await page.getByRole("banner").evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe("none");
  });
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 375, height: 700 } });
  const button = (page: Page) => page.locator('header summary[aria-label="Menu"]');
  const panel = (page: Page) => page.getByRole("navigation", { name: "Main menu" });

  test("is an 80px bar with GitHub and a 40x40 menu button, and the page links only in the panel", async ({ page }) => {
    await page.goto("/en");
    const box = await button(page).boundingBox();
    expect([Math.round(box?.width ?? 0), Math.round(box?.height ?? 0)]).toEqual([40, 40]);
    expect(Math.round((await page.getByRole("banner").boundingBox())?.height ?? 0)).toBe(80);
    await expect(page.getByRole("banner").getByRole("link", { name: /GitHub/ })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main", exact: true })).toBeHidden();
    await expect(panel(page)).toBeHidden();
  });

  test("opens, lists the pages with the Product pages under their name, and closes with Escape returning focus to the button", async ({ page }) => {
    await page.goto("/en");
    await button(page).click();
    await expect(panel(page)).toBeVisible();
    await expect(panel(page).getByRole("link")).toHaveText(["Home", "Features", "How it works", "FAQ", "Pricing", "About"]);
    await expect(panel(page).getByText("Product", { exact: true })).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(panel(page).getByRole("link").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeHidden();
    await expect(button(page)).toBeFocused();
  });

  test("holds the language and the theme, and closes after following a link and when clicking outside", async ({ page }) => {
    await page.goto("/en");
    await button(page).click();
    await expect(page.getByRole("link", { name: "Polski" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
    await panel(page).getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/en\/about$/);
    await expect(page.locator("header details:has(summary[aria-label=\"Menu\"])")).not.toHaveAttribute("open", "");
    await button(page).click();
    await page.mouse.click(8, 690);
    await expect(page.locator("header details:has(summary[aria-label=\"Menu\"])")).not.toHaveAttribute("open", "");
  });

  test("works without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 700 } });
    const page = await context.newPage();
    await page.goto("/en");
    await button(page).click();
    await expect(panel(page).getByRole("link", { name: "FAQ" })).toBeVisible();
    await context.close();
  });
});

test.describe("narrow screens", () => {
  test("the brand stays on one line and the bar does not scroll sideways at 320px, in both languages", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    for (const path of ["/en", "/pl"]) {
      await page.goto(path);
      const brand = await page.getByRole("banner").getByRole("link", { name: /hybrid-rag/ }).first().boundingBox();
      expect(brand?.height ?? 0, path).toBeLessThanOrEqual(40);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), path).toBeLessThanOrEqual(0);
      expect(Math.round((await page.getByRole("banner").boundingBox())?.height ?? 0), path).toBe(80);
    }
  });
});

test.describe("theme pill", () => {
  test("flips between light and dark, remembers the choice and applies it before the first paint", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    const errors = collectErrors(page);
    await page.goto("/en");
    await expect.poll(() => brightness(page)).toBeGreaterThan(128);
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect.poll(() => brightness(page)).toBeLessThan(128);
    await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();

    await page.route("**/_next/static/**/*.js", (r) => r.abort());
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect.poll(() => brightness(page)).toBeLessThan(128);
    await page.unroute("**/_next/static/**/*.js");

    await page.reload();
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect.poll(() => brightness(page)).toBeGreaterThan(128);
    // (The aborted script requests above are the test's own doing.)
    expect(errors.filter((e) => !e.includes("ERR_FAILED"))).toEqual([]);
  });

  test("is the 56x32 horizontal pill in the header, with room above and below", async ({ page }) => {
    await page.goto("/en");
    const box = await page.getByRole("button", { name: "Switch to dark theme" }).boundingBox();
    expect(Math.round(box?.width ?? 0)).toBe(56);
    expect(Math.round(box?.height ?? 0)).toBe(32);
    const header = await page.getByRole("banner").boundingBox();
    expect((header?.height ?? 0) - (box?.height ?? 0)).toBeGreaterThanOrEqual(24);
  });

  test("follows the device until a choice is made", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/pl");
    await expect.poll(() => brightness(page)).toBeLessThan(128);
    await expect(page.getByRole("button", { name: "Przełącz na jasny motyw" })).toBeVisible();
  });
});
