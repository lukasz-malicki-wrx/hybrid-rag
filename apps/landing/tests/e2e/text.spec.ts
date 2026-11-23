import { expect, test } from "@playwright/test";
import { LOCALES, pathOf, SLUGS } from "./helpers";

/** The texts of every page, read as a reader or a screen reader would: link names and the length of a line. */

test.describe("link texts", () => {
  for (const locale of LOCALES) {
    for (const slug of SLUGS) {
      test(`${pathOf(locale, slug)}: links with the same words go to the same place, and none says only "learn more"`, async ({ page }) => {
        await page.goto(pathOf(locale, slug));
        const links = await page.locator("main a[href]").evaluateAll((els) =>
          els.map((el) => ({ name: (el.getAttribute("aria-label") ?? el.textContent ?? "").replace(/\s+/g, " ").trim(), href: (el as HTMLAnchorElement).getAttribute("href") ?? "" })),
        );
        const byName = new Map<string, Set<string>>();
        for (const { name, href } of links) byName.set(name, (byName.get(name) ?? new Set()).add(href));
        const clashes = [...byName].filter(([, hrefs]) => hrefs.size > 1).map(([name]) => name);
        expect(clashes).toEqual([]);
        expect(links.filter((l) => /^(learn more|read more|more|zobacz więcej|czytaj więcej|więcej)$/i.test(l.name))).toEqual([]);
      });
    }
  }
});

test.describe("line length", () => {
  for (const slug of ["", "features", "how-it-works", "privacy", "accessibility", "faq"]) {
    test(`/en/${slug}: running text is at most ~75 characters a line`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(pathOf("en", slug));
      const longest = await page.evaluate(() => {
        let max = 0;
        for (const el of document.querySelectorAll("main p, main li, main dd")) {
          if (el.querySelector("p, li, ul, ol, dl, table")) continue;
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          const lines = new Map<number, number>();
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const text = node.textContent ?? "";
            const range = document.createRange();
            for (let i = 0; i < text.length; i++) {
              range.setStart(node, i);
              range.setEnd(node, i + 1);
              const rect = range.getClientRects()[0];
              if (rect) lines.set(Math.round(rect.top), (lines.get(Math.round(rect.top)) ?? 0) + 1);
            }
          }
          if (lines.size > 1) max = Math.max(max, ...lines.values());
        }
        return max;
      });
      expect(longest).toBeLessThanOrEqual(75);
    });
  }
});
