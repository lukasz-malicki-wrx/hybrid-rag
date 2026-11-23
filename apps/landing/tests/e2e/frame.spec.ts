import { expect, test } from "@playwright/test";
import { LOCALES, pathOf, SLUGS } from "./helpers";

/** The frame every page shares: the call to action, the dark footer, the sections and the placeholders. */

test.describe("call to action and footer", () => {
  for (const locale of LOCALES) {
    for (const slug of SLUGS) {
      test(`${pathOf(locale, slug)} ends with the call to action over the footer, and three columns of links`, async ({ page }) => {
        await page.goto(pathOf(locale, slug));
        const cta = page.getByRole("region", { name: locale === "en" ? "Try it on your own PDFs" : "Wypróbuj na własnych PDF-ach" });
        await expect(cta).toBeVisible();
        await expect(cta.getByRole("link")).toHaveCount(2);
        await expect(cta.locator("code")).toHaveText("docker compose up -d --build");
        const footer = page.getByRole("contentinfo");
        // The band sits half on the page and half on the dark footer: left of it, the colour at its top is
        // the page's and the colour at its bottom is the footer's.
        await cta.scrollIntoViewIfNeeded();
        const colours = await cta.evaluate((el) => {
          const box = el.getBoundingClientRect();
          // The topmost element with a colour of its own at the point, siblings included (the dark strip is one).
          const colourAt = (y: number) =>
            document
              .elementsFromPoint(box.left / 2, y)
              .map((node) => getComputedStyle(node).backgroundColor)
              .find((colour) => colour !== "rgba(0, 0, 0, 0)") ?? "";
          return { top: colourAt(box.top + 16), bottom: colourAt(box.bottom - 16) };
        });
        expect(colours.top).toBe(await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor));
        expect(colours.bottom).toBe(await footer.evaluate((el) => getComputedStyle(el).backgroundColor));
        expect(await footer.getByRole("navigation").count()).toBe(3);
        expect(await footer.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(
          await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor),
        );
        // The decoration is hidden from assistive technology and small.
        const pattern = cta.locator(":scope > svg[aria-hidden=true]");
        await expect(pattern).toHaveCount(1);
        expect(((await pattern.evaluate((el) => el.outerHTML)).length), "contour pattern size").toBeLessThan(4096);
      });
    }
  }

  test("a 404 has the footer and no call to action", async ({ page }) => {
    await page.goto("/en/nope");
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.getByRole("region", { name: "Try it on your own PDFs" })).toHaveCount(0);
  });

  test("the footer columns are Product, Project and Legal, each a named navigation", async ({ page }) => {
    await page.goto("/en");
    for (const name of ["Product", "Project", "Legal"]) {
      await expect(page.getByRole("contentinfo").getByRole("navigation", { name })).toBeVisible();
    }
  });
});

test.describe("sections", () => {
  for (const locale of LOCALES) {
    for (const slug of SLUGS) {
      test(`${pathOf(locale, slug)}: neighbouring sections never draw two lines between them`, async ({ page }) => {
        await page.goto(pathOf(locale, slug));
        const lines = await page.evaluate(() => {
          const bands = [...document.querySelectorAll("main > header, main > section")];
          const width = (value: string) => parseFloat(value) || 0;
          return bands.slice(1).map((band, i) => {
            const above = getComputedStyle(bands[i] as Element);
            const below = getComputedStyle(band);
            return { index: i + 1, double: width(above.borderBottomWidth) > 0 && width(below.borderTopWidth) > 0 };
          });
        });
        expect(lines.filter((l) => l.double)).toEqual([]);
      });
    }
  }
});

test.describe("screenshots", () => {
  for (const locale of LOCALES) {
    test(`every page shows real screenshots with a description, no placeholder is left, and none repeats on a page (${locale})`, async ({ page }) => {
      let count = 0;
      for (const slug of SLUGS) {
        await page.goto(pathOf(locale, slug));
        await expect(page.locator("main [role='img']"), `${slug || "home"}: placeholders`).toHaveCount(0);
        const shots = await page.locator("main .shot-auto img").evaluateAll((els) =>
          els.map((el) => ({ alt: (el as HTMLImageElement).alt, src: decodeURIComponent((el as HTMLImageElement).src) })),
        );
        for (const { alt } of shots) expect(alt.length, `${slug || "home"}: description`).toBeGreaterThan(20);
        expect(new Set(shots.map((s) => s.src)).size, `${slug || "home"}: repeated screenshot`).toBe(shots.length);
        count += shots.length;
      }
      expect(count).toBeGreaterThan(10);
    });
  }
});
