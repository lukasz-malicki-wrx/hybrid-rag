import { expect, test, type Page } from "@playwright/test";
import { collectErrors, expectAccessible, expectNoHorizontalScroll, LOCALES, pathOf, SLUGS } from "./helpers";

/**
 * Checks that hold for every page in both languages: keyboard, zoom, reflow, motion, no JavaScript,
 * forced colors, console and CSP, headings and the language of parts. Metadata, structured data and the
 * sitemap are in `seo.spec.ts`.
 */

const TABBABLE = 'a[href], button:not([disabled]), summary, input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

interface Stop {
  index: number;
  label: string;
  outlined: boolean;
  inViewport: boolean;
  obscured: boolean;
}

/** Presses Tab through the whole page. Gives every tabbable element an index first, to compare the order. */
async function walkWithKeyboard(page: Page) {
  const tabbable = await page.evaluate((selector) => {
    const visible = (el: Element) => {
      const box = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      // The content of a closed <details> has a box but cannot be focused; its <summary> can.
      const collapsed = el.closest("details:not([open])") && !(el.tagName === "SUMMARY" && el.parentElement?.tagName === "DETAILS");
      return box.width > 0 && box.height > 0 && style.visibility !== "hidden" && !collapsed;
    };
    const list = [...document.querySelectorAll(selector)].filter((el) => el.getAttribute("tabindex") !== "-1" && (visible(el) || el.matches('a[href="#main"]')));
    list.forEach((el, index) => el.setAttribute("data-qa-tab", String(index)));
    return { count: list.length, positive: [...document.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])')].length };
  }, TABBABLE);

  const stops: Stop[] = [];
  for (let i = 0; i < tabbable.count + 3; i++) {
    await page.keyboard.press("Tab");
    const stop = await page.evaluate((): Stop | null => {
      const el = document.activeElement;
      if (!el || el === document.body || el === document.documentElement) return null;
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      const cx = Math.min(Math.max(box.left + box.width / 2, 0), innerWidth - 1);
      const cy = Math.min(Math.max(box.top + box.height / 2, 0), innerHeight - 1);
      const top = document.elementFromPoint(cx, cy);
      return {
        index: Number(el.getAttribute("data-qa-tab") ?? -1),
        label: `${el.tagName.toLowerCase()} "${(el.textContent ?? "").trim().slice(0, 30) || el.getAttribute("aria-label") || ""}"`,
        outlined: (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== "none",
        inViewport: box.bottom > 0 && box.right > 0 && box.top < innerHeight && box.left < innerWidth,
        obscured: !(top && (top === el || el.contains(top) || top.contains(el))),
      };
    });
    if (!stop) break; // focus left the page (or came back to the browser): the end, no trap
    stops.push(stop);
    if (stops.length > 1 && stop.index === stops[0]?.index) {
      stops.pop();
      break; // wrapped around
    }
  }
  return { stops, tabbable };
}

for (const locale of LOCALES) {
  for (const slug of SLUGS) {
    const path = pathOf(locale, slug);

    test.describe(`quality ${path}`, () => {
      for (const width of [1280, 375]) {
        test(`keyboard walk at ${width}px: DOM order, a visible and unobscured focus on every stop, no trap`, async ({ page }) => {
          await page.setViewportSize({ width, height: 800 });
          await page.goto(path);
          const { stops, tabbable } = await walkWithKeyboard(page);
          expect(tabbable.positive, "no positive tabindex").toBe(0);
          expect(stops.length, "every tabbable element is reached, and the walk ended").toBe(tabbable.count);
          expect(
            stops.map((s) => s.index),
            "the focus order is the DOM order",
          ).toEqual(stops.map((_, i) => i));
          expect(stops.filter((s) => !s.outlined).map((s) => s.label), "no visible focus indicator").toEqual([]);
          expect(stops.filter((s) => !s.inViewport).map((s) => s.label), "focus is scrolled into view").toEqual([]);
          expect(stops.filter((s) => s.obscured).map((s) => s.label), "focused element covered by something").toEqual([]);
        });
      }

      for (const scheme of ["light", "dark"] as const) {
        test(`is accessible in forced colors (${scheme})`, async ({ page }) => {
          await page.emulateMedia({ forcedColors: "active", colorScheme: scheme });
          await page.goto(path);
          await expect(page.locator("h1")).toBeVisible();
          // axe reads the authored colours, not the ones forced colors substitutes (it reported 1.24:1 for a
          // button whose forced text is yellow on black), so its contrast rule is off here; the real
          // contrast is checked in light and dark by pages.spec.ts, and every other rule still applies.
          await expectAccessible(page, ["color-contrast"]);
          const hidden = await page.locator("main a, main button, main summary").evaluateAll((els) =>
            els.filter((el) => el.getBoundingClientRect().width > 0 && getComputedStyle(el).color === getComputedStyle(el).backgroundColor).map((el) => (el.textContent ?? "").trim()),
          );
          expect(hidden, "text in the colour of its background").toEqual([]);
        });
      }

      // Browser zoom of 200% at 1280px is a 640px viewport: every size in the page is in rem, so
      // text-only zoom lays out the same way. At 320px there is no narrower viewport to stand for it, so
      // the root font size is doubled there (the breakpoints stay on the phone layout, as they would).
      for (const [width, rootFontSize] of [[640, "100%"], [320, "200%"]] as const) {
        test(`text at 200% (${width}px viewport, root font ${rootFontSize}): no sideways scroll, nothing clipped, still accessible`, async ({ page }) => {
          await page.setViewportSize({ width, height: 800 });
          await page.goto(path);
          // Through the CSSOM: the page's CSP does not allow an injected <style>.
          await page.evaluate((size) => document.documentElement.style.setProperty("font-size", size, "important"), rootFontSize);
          await expectNoHorizontalScroll(page);
          const clipped = await page.evaluate(() =>
            [...document.querySelectorAll("body *")]
              .filter((el) => {
                const style = getComputedStyle(el);
                const clips = style.overflowY === "hidden" || style.overflowY === "clip";
                return clips && el.scrollHeight > el.clientHeight + 1 && el.clientHeight > 1 && el.clientWidth > 1 && !el.closest("svg"); // (the visually hidden skip link is 1px by design)
              })
              .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`),
          );
          expect(clipped, "content cut off by its container").toEqual([]);
          await expectAccessible(page);
        });
      }

      test("reflows at 320px: nothing sticks out of the viewport unless it scrolls by itself", async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 700 });
        await page.goto(path);
        await expectNoHorizontalScroll(page);
        const outside = await page.evaluate(() =>
          [...document.querySelectorAll("body *")]
            .filter((el) => {
              if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") return false;
              const box = el.getBoundingClientRect();
              if (box.width === 0 || box.right <= document.documentElement.clientWidth + 0.5) return false;
              // Allowed: inside a box that scrolls on its own (a code block, a table wrapper).
              for (let p = el.parentElement; p; p = p.parentElement) {
                const overflowX = getComputedStyle(p).overflowX;
                if (overflowX === "auto" || overflowX === "scroll") return false;
              }
              return true;
            })
            .map((el) => `${el.tagName.toLowerCase()} ${Math.round(el.getBoundingClientRect().right)}`),
        );
        expect(outside).toEqual([]);
      });

      test("respects prefers-reduced-motion: nothing animates, nothing scrolls smoothly", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(path);
        await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
        const running = await page.evaluate(() =>
          document
            .getAnimations()
            .filter((a) => a.playState === "running")
            .map((a) => a.effect?.getComputedTiming().duration),
        );
        expect(running, "running animations or transitions").toEqual([]);
        expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).not.toBe("smooth");
      });

      test("shows the same content without JavaScript", async ({ browser, page }) => {
        await page.goto(path);
        const withScript = await page.getByRole("main").innerText();
        const context = await browser.newContext({ javaScriptEnabled: false });
        const bare = await context.newPage();
        await bare.goto(new URL(path, page.url()).href);
        await expect(bare.locator("h1")).toBeVisible();
        expect(await bare.getByRole("main").innerText()).toBe(withScript);
        await expect(bare.getByRole("navigation").first()).toBeAttached();
        await expectNoHorizontalScroll(bare);
        await context.close();
      });

      test("logs no console error, CSP violation or failed request while the page is read and used", async ({ page }) => {
        const errors = collectErrors(page);
        const failed: string[] = [];
        page.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
        page.on("requestfailed", (r) => failed.push(`failed ${r.url()}`));
        await page.addInitScript(() => {
          (window as unknown as { csp: string[] }).csp = [];
          document.addEventListener("securitypolicyviolation", (e) => (window as unknown as { csp: string[] }).csp.push(`${e.violatedDirective} ${e.blockedURI}`));
        });
        await page.goto(path);
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) {
            scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
        });
        await page.getByRole("button", { name: /theme|motyw/i }).click();
        await page.waitForLoadState("networkidle");
        expect(await page.evaluate(() => (window as unknown as { csp: string[] }).csp)).toEqual([]);
        expect(errors).toEqual([]);
        expect(failed).toEqual([]);
      });

      test("has one h1 first, a heading outline without gaps and no empty heading", async ({ page }) => {
        await page.goto(path);
        const headings = await page.evaluate(() =>
          [...document.querySelectorAll("h1, h2, h3, h4, h5, h6, [role=heading]")]
            .filter((el) => el.getBoundingClientRect().width > 0 || el.closest("details"))
            .map((el) => ({
              level: Number(el.getAttribute("aria-level") ?? el.tagName.slice(1)),
              text: (el.textContent ?? "").trim(),
              inMain: !!el.closest("main"),
            })),
        );
        expect(headings.filter((h) => h.level === 1)).toHaveLength(1);
        expect(headings[0]?.level, "the first heading").toBe(1);
        expect(headings.filter((h) => !h.text).length, "empty headings").toBe(0);
        const jumps = headings.flatMap((h, i) => (i > 0 && h.level > (headings[i - 1]?.level ?? 0) + 1 ? [`${headings[i - 1]?.level} -> ${h.level} "${h.text}"`] : []));
        expect(jumps, "a level is skipped").toEqual([]);
        const texts = headings.filter((h) => h.level === 2).map((h) => h.text);
        expect(new Set(texts).size, "two h2 with the same text").toBe(texts.length);
      });

      test("marks text in the other language with lang, and nothing else", async ({ page }) => {
        await page.goto(path);
        const other = locale === "en" ? "pl" : "en";
        const found = await page.evaluate(
          ({ locale }) => {
            const stop = locale === "pl" ? /\b(the|and|with|your|for|from|that|this|are)\b/gi : /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]|\b(jest|nie|się|oraz|dla|przez)\b/gi;
            const unmarked: string[] = [];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
              const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
              const parent = node.parentElement;
              if (!text || !parent || parent.closest("code, pre, script, style, svg, [lang]:not(html)")) continue;
              const hits = text.match(stop)?.length ?? 0;
              // Two or more function words, or a letter of the other alphabet, in a sentence of the page's own language.
              if (hits >= (locale === "pl" ? 2 : 1)) unmarked.push(text.slice(0, 80));
            }
            const marked = [...document.querySelectorAll("[lang]:not(html)")].map((el) => `${el.getAttribute("lang")} ${el.tagName.toLowerCase()}`);
            return { unmarked, marked };
          },
          { locale },
        );
        expect(found.unmarked, `text that looks ${other} but has no lang="${other}"`).toEqual([]);
        for (const entry of found.marked) expect(entry.split(" ")[0], entry).toMatch(/^(en|pl)$/);
      });
    });
  }
}
