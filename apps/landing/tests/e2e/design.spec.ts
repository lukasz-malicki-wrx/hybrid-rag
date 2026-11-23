import { expect, test, type Page } from "@playwright/test";
import { LOCALES, pathOf, SLUGS } from "./helpers";

/** The look of the redesign: what the Figma layout asks for and what the review found, measured in the browser. */

const SCHEMES = ["light", "dark"] as const;

const rgb = (value: string) => (value.match(/[\d.]+/g) ?? []).map(Number);

/** The colour a box is painted with: its own, or the nearest ancestor's that is not transparent. */
const paintOf = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => {
    for (let node: Element | null = el; node; node = node.parentElement) {
      const colour = getComputedStyle(node).backgroundColor;
      if (colour !== "rgba(0, 0, 0, 0)") return colour;
    }
    return "";
  });

test.describe("cards stand out from the section they are in", () => {
  for (const scheme of SCHEMES) {
    for (const [path, section] of [
      ["/en", "#home-gallery"],
      ["/en", "#home-examples"],
      ["/en/about", "section[aria-labelledby=contribute-heading]"],
      ["/en/features", "section[aria-labelledby=features-overview]"],
      ["/en/pricing", "section[aria-labelledby=table-heading]"],
    ] as const) {
      test(`${path} ${section} (${scheme}): the card colour differs from its section's`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(path);
        const root = section.startsWith("#") ? `section[aria-labelledby=${section.slice(1)}]` : section;
        const card = `${root} li.border, ${root} section.border`;
        const cardPaint = await paintOf(page, card);
        const sectionPaint = await page.locator(root).first().evaluate((el) => getComputedStyle(el).backgroundColor);
        expect(rgb(cardPaint).length).toBeGreaterThan(2);
        expect(cardPaint, `${path} card`).not.toBe(sectionPaint);
      });
    }
  }

  test("cards on a plain section keep the surface colour, so they differ from the page there too", async ({ page }) => {
    await page.goto("/en");
    const card = await paintOf(page, "section[aria-labelledby=home-strengths] li");
    const body = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(card).not.toBe(body);
  });
});

test.describe("home, from the Figma layout", () => {
  test("the doodle is 64px and sits outside the corner of the picture, on both sides", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    const boxes = await page.evaluate(() => {
      const marks = [...document.querySelectorAll("main svg[aria-hidden=true][viewBox='0 0 48 48']")].filter((el) => getComputedStyle(el).display !== "none");
      return marks.map((el) => {
        const mark = el.getBoundingClientRect();
        const picture = (el.nextElementSibling as HTMLElement).getBoundingClientRect();
        return { w: mark.width, h: mark.height, leftOfPicture: picture.left - mark.left, rightOfPicture: mark.right - picture.right, aboveTop: picture.top - mark.top };
      });
    });
    expect(boxes).toHaveLength(2);
    for (const box of boxes) {
      expect(box.w).toBe(64);
      expect(box.h).toBe(64);
      expect(box.aboveTop).toBeGreaterThan(30);
    }
    expect(boxes[0]?.leftOfPicture).toBeGreaterThan(30);
    expect(boxes[1]?.rightOfPicture).toBeGreaterThan(30);
  });

  test("the numbers band has 2x40px dividers, 18px labels and about Figma's height", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    const band = page.locator("dl.on-band");
    const items = band.locator("> div");
    const dividers = await items.evaluateAll((els) =>
      els.map((el) => {
        const style = getComputedStyle(el, "::before");
        return { display: style.display, w: parseFloat(style.width), h: parseFloat(style.height), borderLeft: getComputedStyle(el).borderLeftWidth };
      }),
    );
    expect(dividers.map((d) => d.display)).toEqual(["none", "block", "block", "block"]);
    for (const d of dividers.slice(1)) {
      expect(d.w).toBe(2);
      expect(d.h).toBe(40);
      expect(d.borderLeft).toBe("0px");
    }
    expect(await band.locator("dt").first().evaluate((el) => getComputedStyle(el).fontSize)).toBe("18px");
    const height = (await band.boundingBox())?.height ?? 0;
    expect(height).toBeGreaterThan(200);
    expect(height).toBeLessThan(240);
  });

  test("the two primary calls to action have an arrow", async ({ page }) => {
    await page.goto("/en");
    for (const name of ["See how it works", "Explore all features"]) {
      await expect(page.getByRole("link", { name }).locator("svg[aria-hidden=true]")).toHaveCount(1);
    }
  });

  test("the type scale: card title 24 and text 16, gallery title 18, eyebrow 16, nothing under 12", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    const size = (selector: string) => page.locator(selector).first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(await size("section[aria-labelledby=home-strengths] li h3")).toBe(24);
    expect(await size("section[aria-labelledby=home-strengths] li p")).toBe(16);
    expect(await size("section[aria-labelledby=home-gallery] li h3")).toBe(18);
    expect(await size("main header p")).toBeGreaterThanOrEqual(16);
    const smallest = await page.evaluate(() => {
      let min = 99;
      for (const el of document.querySelectorAll("body *")) {
        if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim())) continue;
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        min = Math.min(min, parseFloat(style.fontSize));
      }
      return min;
    });
    expect(smallest).toBeGreaterThanOrEqual(12);
  });

  for (const locale of LOCALES) {
    for (const width of [1280, 1440]) {
      test(`the strengths' links stay on one line and the cards are about equally tall (${locale}, ${width}px)`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(pathOf(locale, ""));
        const links = page.locator("section[aria-labelledby=home-strengths] li a");
        await expect(links).toHaveCount(4);
        const heights = await links.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
        for (const h of heights) expect(h, "link height (one line is 32px)").toBeLessThan(40);
        const cards = await page.locator("section[aria-labelledby=home-strengths] li.border").evaluateAll((els) => els.map((el) => el.querySelector("p")?.textContent?.length ?? 0));
        expect(Math.max(...cards) / Math.min(...cards), "text lengths").toBeLessThan(1.4);
      });
    }
  }

  test("the refusal example asks something harmless", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByText("What is a good recipe for pancakes?")).toBeVisible();
    await expect(page.getByText(/paracetamol|dose/i)).toHaveCount(0);
    await page.goto("/pl");
    await expect(page.getByText("Jaki jest dobry przepis na naleśniki?")).toBeVisible();
  });

  test("does not list a shorter set of what goes to Anthropic: it links to the privacy page", async ({ page }) => {
    await page.goto("/en");
    const text = await page.locator("main").innerText();
    expect(text).not.toMatch(/passages sent with each question/);
    await expect(page.getByRole("link", { name: "Where your data goes" })).toHaveAttribute("href", "/en/privacy");
  });
});

test.describe("on a phone the pictures run to the edges (under the text in a page header, under the site header in a section)", () => {
  for (const [path, selector] of [
    ["/en", "main header"],
    ["/en", "section[aria-labelledby=home-about]"],
    ["/en/features", "main header"],
    ["/en/about", "main header"],
    ["/pl/how-it-works", "main header"],
  ] as const) {
    test(`${path} ${selector}`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(path);
      const geometry = await page.locator(selector).first().evaluate((el) => {
        const picture = el.querySelector(".screenshot, [role=img]") as HTMLElement;
        const frame = picture.parentElement as HTMLElement;
        const box = frame.getBoundingClientRect();
        const heading = el.querySelector("h1, h2") as HTMLElement;
        return {
          left: box.left,
          right: window.innerWidth - box.right,
          ratio: box.width / box.height,
          radius: getComputedStyle(frame).borderTopLeftRadius,
          top: box.top - el.getBoundingClientRect().top,
          gapToText: heading.getBoundingClientRect().top - box.bottom,
          gapAfterText: box.top - heading.getBoundingClientRect().bottom,
        };
      });
      expect(geometry.left).toBe(0);
      expect(geometry.right).toBe(0);
      expect(geometry.ratio).toBeCloseTo(375 / 240, 1);
      expect(geometry.radius).toBe("0px");
      if (selector === "main header") {
        // A page header: the text comes first, the picture follows it.
        expect(geometry.gapAfterText).toBeGreaterThanOrEqual(40);
      } else {
        expect(geometry.top).toBe(0);
        expect(geometry.gapToText).toBeGreaterThanOrEqual(40);
      }
      // No sideways scroll from the bleed.
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    });
  }
});

test.describe("the top of a page", () => {
  test("has the same space above on an inner page as on the home page, at the desktop width", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const top = async (path: string) => {
      await page.goto(path);
      return page.locator("main header").first().evaluate((el) => getComputedStyle(el).paddingTop);
    };
    const home = await top("/en");
    for (const slug of SLUGS.filter(Boolean)) expect(await top(`/en/${slug}`), slug).toBe(home);
  });
});

test.describe("pictures beside long lists", () => {
  for (const path of ["/en/features", "/en/how-it-works"]) {
    test(`${path}: the picture starts level with the text, not in the middle of it`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      const rows = await page.locator("main section").evaluateAll((sections) =>
        sections
          .map((section) => {
            const grid = section.querySelector(":scope > div > div.grid") as HTMLElement | null;
            const frame = grid?.querySelector(".screenshot, [role=img]")?.closest(".overflow-hidden") as HTMLElement | null;
            if (!grid || !frame || grid.children.length !== 2) return null;
            const text = [...grid.children].find((child) => !child.contains(frame)) as HTMLElement;
            return { picture: frame.getBoundingClientRect().top - grid.getBoundingClientRect().top, text: text.getBoundingClientRect().top - grid.getBoundingClientRect().top, tall: text.getBoundingClientRect().height > frame.getBoundingClientRect().height + 200 };
          })
          .filter((row) => row !== null),
      );
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) expect(Math.abs(row.picture - row.text)).toBeLessThan(2);
    });
  }

  test("the picture of a long feature group follows the reader and stays inside its section", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/features");
    const frame = page.locator("#chat .overflow-hidden").first();
    const section = page.locator("#chat");
    const before = (await frame.boundingBox())?.y ?? 0;
    await section.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 300));
    const after = await frame.boundingBox();
    const bounds = await section.boundingBox();
    expect(after && bounds && after.y >= 0 && after.y + after.height <= bounds.y + bounds.height).toBe(true);
    expect(before).not.toBeNull();
  });
});

test.describe("the example answers", () => {
  for (const locale of LOCALES) {
    for (const width of [1024, 1440]) {
      test(`have an 80px tile and question bars, answers and sources of the same height in both cards (${locale}, ${width}px)`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(pathOf(locale, ""));
        const cards = page.locator("section[aria-labelledby=home-examples] > div > ul > li");
        await expect(cards).toHaveCount(2);
        const parts = await cards.evaluateAll((els) =>
          els.map((el) => {
            const height = (node: Element | null) => Math.round(node?.getBoundingClientRect().height ?? 0);
            const header = el.children[0] as HTMLElement;
            return { tile: height(header.children[0] ?? null), tileWidth: Math.round(header.children[0]?.getBoundingClientRect().width ?? 0), bar: height(header.children[1] ?? null), answer: height(el.children[1] ?? null), source: height(el.children[2] ?? null) };
          }),
        );
        expect(parts[0]?.tile).toBe(80);
        expect(parts[0]?.tileWidth).toBe(80);
        expect(parts[1]?.tile).toBe(80);
        expect(parts[0]?.bar).toBe(parts[1]?.bar);
        expect(parts[0]?.answer).toBe(parts[1]?.answer);
        expect(parts[0]?.source).toBe(parts[1]?.source);
        expect(parts[0]?.bar).toBeGreaterThanOrEqual(80);
      });
    }
  }
});

test("the how-it-works page opens with its own picture, not the chat that the features page shows", async ({ page }) => {
  await page.goto("/en/how-it-works");
  // The light pictures (one per screenshot; the dark twin is hidden): the first is how-flow, none repeats.
  const sources = await page.locator("main .shot-auto img").evaluateAll((els) => els.map((el) => (el as HTMLImageElement).src));
  expect(decodeURIComponent(sources[0] ?? "")).toContain("/screenshots/how-flow-light.webp");
  expect(new Set(sources).size).toBe(sources.length);
  await page.goto("/pl/how-it-works");
  await expect(page.getByRole("img", { name: /Pytanie zadane z dołączonym plikiem PDF/ }).first()).toBeVisible();
});
