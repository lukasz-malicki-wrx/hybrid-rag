import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const LOCALES = ["en", "pl"] as const;
export const SLUGS = ["", "features", "how-it-works", "pricing", "about", "faq", "privacy", "accessibility"] as const;

export const pathOf = (locale: string, slug: string) => (slug ? `/${locale}/${slug}` : `/${locale}`);

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

/**
 * Fails on any WCAG 2.2 AA or best-practice violation axe can detect. `disable` lists rule ids to leave
 * out; give the reason where you pass it.
 */
export async function expectAccessible(page: Page, disable: string[] = []) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).disableRules(disable).analyze();
  const summary = violations.map(
    (v) =>
      `${v.id}: ${v.help}\n` +
      v.nodes.map((n) => `  ${n.target.join(" ")}: ${n.failureSummary?.split("\n").slice(1).join(" ")}`).join("\n"),
  );
  expect(summary, summary.join("\n")).toEqual([]);
}

/** Collects console errors and page errors (CSP violations and hydration problems are among them). */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "horizontal scroll").toBeLessThanOrEqual(0);
}

/** Brightness of the page background (0-255), so tests do not depend on the palette. */
export const brightness = (page: Page) =>
  page.locator("body").evaluate((el) => {
    const [r = 0, g = 0, b = 0] = (getComputedStyle(el).backgroundColor.match(/\d+/g) ?? []).map(Number);
    return (r + g + b) / 3;
  });
