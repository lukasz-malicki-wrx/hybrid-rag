import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALES } from "./i18n";
import { allPaths, LEGAL_PAGE_IDS, NAV_PAGE_IDS, PAGE_IDS, PRODUCT_PAGE_IDS, pageIdFromPath, pagePath } from "./routes";

describe("pagePath", () => {
  it("builds the address of a page in a language", () => {
    expect(pagePath("home", "en")).toBe("/en");
    expect(pagePath("home", "pl")).toBe("/pl");
    expect(pagePath("how-it-works", "pl")).toBe("/pl/how-it-works");
  });
});

describe("pageIdFromPath", () => {
  it("finds the page and the language of every address", () => {
    for (const locale of LOCALES) {
      for (const id of PAGE_IDS) expect(pageIdFromPath(pagePath(id, locale))).toEqual({ id, locale });
    }
  });

  it("accepts a trailing slash", () => {
    expect(pageIdFromPath("/en/pricing/")).toEqual({ id: "pricing", locale: "en" });
    expect(pageIdFromPath("/pl/")).toEqual({ id: "home", locale: "pl" });
  });

  it("returns null for anything that is not a page", () => {
    expect(pageIdFromPath("/")).toBeNull();
    expect(pageIdFromPath("/de/pricing")).toBeNull();
    expect(pageIdFromPath("/en/nope")).toBeNull();
    expect(pageIdFromPath("/en/pricing/extra")).toBeNull();
  });
});

describe("page lists", () => {
  it("keeps header and footer groups inside the known pages, without repeats", () => {
    for (const list of [NAV_PAGE_IDS, PRODUCT_PAGE_IDS, LEGAL_PAGE_IDS]) {
      expect(new Set(list).size).toBe(list.length);
      for (const id of list) expect(PAGE_IDS).toContain(id);
    }
  });

  it("lists every page of the site in the header or the footer", () => {
    const linked: readonly string[] = [...NAV_PAGE_IDS, ...PRODUCT_PAGE_IDS, ...LEGAL_PAGE_IDS, "about"];
    for (const id of PAGE_IDS) expect(linked, id).toContain(id);
  });

  it("matches lighthouse/pages.json, the list Lighthouse CI audits", () => {
    const file = path.resolve(import.meta.dirname, "../../lighthouse/pages.json");
    expect(JSON.parse(readFileSync(file, "utf8"))).toEqual(allPaths());
  });
});
