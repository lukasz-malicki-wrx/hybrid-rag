import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, isLocale, negotiateLocale, otherLocale } from "./i18n";

describe("negotiateLocale", () => {
  it("falls back to the default language without a header", () => {
    expect(negotiateLocale(null)).toBe(DEFAULT_LOCALE);
    expect(negotiateLocale("")).toBe(DEFAULT_LOCALE);
  });

  it("picks a supported language and ignores regions", () => {
    expect(negotiateLocale("pl")).toBe("pl");
    expect(negotiateLocale("pl-PL,pl;q=0.9,en-US;q=0.8")).toBe("pl");
    expect(negotiateLocale("PL-pl")).toBe("pl");
  });

  it("follows the quality values, not the order", () => {
    expect(negotiateLocale("pl;q=0.4,en;q=0.9")).toBe("en");
    expect(negotiateLocale("de,pl;q=0.7,en;q=0.2")).toBe("pl");
  });

  it("takes the first of equal qualities", () => {
    expect(negotiateLocale("pl,en")).toBe("pl");
    expect(negotiateLocale("en,pl")).toBe("en");
  });

  it("skips languages that are not acceptable (q=0) or not supported", () => {
    expect(negotiateLocale("pl;q=0,en;q=0.5")).toBe("en");
    expect(negotiateLocale("de,fr;q=0.8")).toBe(DEFAULT_LOCALE);
    expect(negotiateLocale("*")).toBe(DEFAULT_LOCALE);
  });

  it("survives junk", () => {
    expect(negotiateLocale(";;;,,q=")).toBe(DEFAULT_LOCALE);
    expect(negotiateLocale("pl;q=abc")).toBe(DEFAULT_LOCALE);
  });
});

describe("locale helpers", () => {
  it("recognises only listed languages", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("pl")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale("EN")).toBe(false);
  });

  it("switches to the other language", () => {
    expect(otherLocale("en")).toBe("pl");
    expect(otherLocale("pl")).toBe("en");
  });
});
