import { compareCatalogs, interpolate } from "@hybrid-rag/i18n";
import { describe, expect, it } from "vitest";
import { LOCALES } from "./config";
import { detectLocale } from "./detect";
import { MESSAGES } from "./messages";
import { en } from "./messages/en";
import { createTranslator } from "./translate";

describe.each(LOCALES.filter((l) => l !== "en"))("%s translation", (locale) => {
  it("has every English key, no extra keys, the same placeholders and every plural form the language needs", () => {
    expect(compareCatalogs(en, MESSAGES[locale], locale)).toEqual([]);
  });
});

describe("translator", () => {
  it("fills placeholders", () => {
    expect(interpolate("Hi {name}", { name: "Ann" })).toBe("Hi Ann");
    expect(interpolate("Hi {name}")).toBe("Hi {name}");
  });

  it("chooses Polish plural forms", () => {
    const { tp } = createTranslator("pl");
    expect(tp("counts.conversations", 1)).toBe("1 rozmowa");
    expect(tp("counts.conversations", 3)).toBe("3 rozmowy");
    expect(tp("counts.conversations", 5)).toBe("5 rozmów");
    expect(tp("counts.conversations", 22)).toBe("22 rozmowy");
  });

  it("chooses English plural forms", () => {
    const { tp, t } = createTranslator("en");
    expect(tp("counts.conversations", 1)).toBe("1 conversation");
    expect(tp("counts.conversations", 3)).toBe("3 conversations");
    expect(t("scope.group", { name: "med" })).toBe("Searching group “med”");
  });
});

describe("detectLocale", () => {
  it("picks the first supported browser language", () => {
    expect(detectLocale(["pl-PL", "en-US"])).toBe("pl");
    expect(detectLocale(["de-DE", "pl"])).toBe("pl");
    expect(detectLocale(["en-GB"])).toBe("en");
  });

  it("falls back to English", () => {
    expect(detectLocale(["de-DE", "fr"])).toBe("en");
    expect(detectLocale([])).toBe("en");
  });
});
