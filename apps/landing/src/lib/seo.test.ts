import { describe, expect, it } from "vitest";
import { LOCALES } from "./i18n";
import { ogImagePath } from "./og-image";
import { PAGE_IDS, pagePath } from "./routes";
import { buildMetadata, languageAlternates, pageTitle } from "./seo";

describe("languageAlternates", () => {
  it("lists every language and points x-default at English", () => {
    expect(languageAlternates("pricing")).toEqual({
      en: "/en/pricing",
      pl: "/pl/pricing",
      "x-default": "/en/pricing",
    });
  });
});

describe("pageTitle", () => {
  it("adds the site name to every page but the home page", () => {
    expect(pageTitle("pricing", "Pricing")).toBe("Pricing | hybrid-rag");
    expect(pageTitle("home", "hybrid-rag: ask your PDFs")).toBe("hybrid-rag: ask your PDFs");
  });
});

describe("buildMetadata", () => {
  it("gives every page in every language a canonical link, alternates, Open Graph and Twitter", () => {
    for (const locale of LOCALES) {
      for (const id of PAGE_IDS) {
        const meta = buildMetadata(id, locale);
        expect(meta.alternates?.canonical).toBe(pagePath(id, locale));
        expect(Object.keys(meta.alternates?.languages ?? {})).toEqual([...LOCALES, "x-default"]);
        expect(meta.openGraph).toMatchObject({ url: pagePath(id, locale), title: meta.title });
        expect(meta.twitter).toMatchObject({ card: "summary_large_image" });
        expect(typeof meta.description).toBe("string");
      }
    }
  });

  it("points Open Graph and Twitter at the card of that page and language, with a description of it", () => {
    for (const locale of LOCALES) {
      for (const id of PAGE_IDS) {
        const meta = buildMetadata(id, locale);
        const expected = [expect.objectContaining({ url: ogImagePath(id, locale), width: 1200, height: 630, alt: expect.stringMatching(/.{20}/) })];
        expect(meta.openGraph).toMatchObject({ images: expected });
        expect(meta.twitter).toMatchObject({ images: expected });
      }
    }
  });

  it("allows indexing when not on a Vercel preview", () => {
    expect(buildMetadata("home", "en").robots).toEqual({ index: true, follow: true });
  });
});
