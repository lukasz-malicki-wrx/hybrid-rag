import { describe, expect, it } from "vitest";
import { LOCALES } from "./i18n";
import { OG_ROUTE, ogImageParams, ogImagePath, ogTitleSize, parseOgParams } from "./og-image";
import { PAGE_IDS } from "./routes";

describe("ogImagePath", () => {
  it("is below the path the proxy does not touch", () => {
    expect(ogImagePath("how-it-works", "pl")).toBe("/opengraph-image/pl/how-it-works");
    expect(ogImagePath("home", "en").startsWith(OG_ROUTE)).toBe(true);
  });
});

describe("ogImageParams", () => {
  it("has an image for every page in every language, once", () => {
    const params = ogImageParams();
    expect(params).toHaveLength(LOCALES.length * PAGE_IDS.length);
    expect(new Set(params.map((p) => ogImagePath(p.page, p.locale))).size).toBe(params.length);
  });
});

describe("parseOgParams", () => {
  it("accepts a known language and page", () => {
    expect(parseOgParams("pl", "faq")).toEqual({ locale: "pl", id: "faq" });
  });

  it("rejects the rest", () => {
    expect(parseOgParams("de", "faq")).toBeNull();
    expect(parseOgParams("en", "nothing")).toBeNull();
  });
});

describe("ogTitleSize", () => {
  it("shrinks as the title grows", () => {
    expect(ogTitleSize("Pricing")).toBeGreaterThan(ogTitleSize("hybrid-rag: ask your PDFs, check every answer"));
    expect(ogTitleSize("x".repeat(80))).toBeLessThan(ogTitleSize("x".repeat(40)));
  });
});
