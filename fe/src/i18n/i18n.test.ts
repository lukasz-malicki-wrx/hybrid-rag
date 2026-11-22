import { describe, expect, it } from "vitest";
import { LOCALES } from "./config";
import { detectLocale } from "./detect";
import { MESSAGES } from "./messages";
import { en } from "./messages/en";
import { createTranslator, interpolate } from "./translate";

type Node = { [key: string]: Node | string };

const isPlural = (node: Node | string): node is Node =>
  typeof node === "object" && "one" in node && "other" in node;

/** Every leaf path; plural messages count as one leaf. */
function paths(node: Node, prefix = ""): string[] {
  return Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" || isPlural(value) ? [path] : paths(value, path);
  });
}

function pluralPaths(node: Node, prefix = ""): [string, Node][] {
  return Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") return [];
    return isPlural(value) ? [[path, value] as [string, Node]] : pluralPaths(value, path);
  });
}

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

const english = en as unknown as Node;

describe.each(LOCALES.filter((l) => l !== "en"))("%s translation", (locale) => {
  const messages = MESSAGES[locale] as unknown as Node;

  it("has every English key and no extra keys", () => {
    expect(paths(messages).sort()).toEqual(paths(english).sort());
  });

  it("uses the same placeholders as English", () => {
    for (const path of paths(english)) {
      const source = path.split(".").reduce<Node | string>((n, p) => (n as Node)[p], english);
      const target = path.split(".").reduce<Node | string>((n, p) => (n as Node)[p], messages);
      const sourceText = typeof source === "string" ? source : (source as Node).other as string;
      const targetText = typeof target === "string" ? target : (target as Node).other as string;
      expect(placeholders(targetText), path).toEqual(placeholders(sourceText));
    }
  });

  it("has every plural form the language needs", () => {
    const needed = new Intl.PluralRules(locale).resolvedOptions().pluralCategories;
    for (const [path, forms] of pluralPaths(messages)) {
      for (const category of needed) expect(forms, `${path}.${category}`).toHaveProperty(category);
    }
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
