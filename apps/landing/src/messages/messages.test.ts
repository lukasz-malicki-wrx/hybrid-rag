import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { catalogPaths, compareCatalogs } from "@hybrid-rag/i18n";
import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n";
import { PAGE_IDS } from "@/lib/routes";
import { SCREENSHOT_IDS } from "@/config/screenshots";
import { MESSAGES } from "./index";

const SRC = path.resolve(import.meta.dirname, "..");

describe.each(LOCALES.filter((l) => l !== "en"))("%s catalog", (locale) => {
  it("has every English key and nothing else, the same {placeholders} and <tags>, every plural form, no empty text", () => {
    expect(compareCatalogs(MESSAGES.en, MESSAGES[locale], locale)).toEqual([]);
  });
});

describe("Polish address", () => {
  // The reader may be a man or a woman: no "sam", "sama" or past tense in the second person ("zrobiłeś").
  it("uses no form that assumes the reader's gender", () => {
    const texts = [...JSON.stringify(MESSAGES.pl).matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"/g)].map((m) => m[1] ?? "");
    // "ten sam", "ta sama" are fine; "uruchamiasz sam" and "-łeś" / "-łaś" are not.
    const bad = texts.filter((text) => /(?<!\p{L})(?<!ten |Ten )sam(?!\p{L})|(?<!\p{L})(?<!ta |Ta )sama(?!\p{L})|\p{L}(łeś|łaś)(?!\p{L})/u.test(text));
    expect(bad).toEqual([]);
  });
});

describe("catalog contents", () => {
  const keys = catalogPaths(MESSAGES.en);

  it("has the title and description of every page, and a hero for it", () => {
    for (const id of PAGE_IDS) {
      expect(keys, id).toContain(`meta.${id}.title`);
      expect(keys, id).toContain(`meta.${id}.description`);
    }
  });

  it("describes every screenshot", () => {
    for (const id of SCREENSHOT_IDS) expect(keys).toContain(`screenshots.${id}`);
  });

  it("names every screenshot, in both languages, with a name no other has (the placeholder says which picture goes there)", () => {
    for (const id of SCREENSHOT_IDS) expect(keys).toContain(`screenshots.names.${id}`);
    for (const locale of LOCALES) {
      const names = SCREENSHOT_IDS.map((id) => (MESSAGES[locale].screenshots.names as Record<string, string>)[id]);
      expect(new Set(names).size, locale).toBe(SCREENSHOT_IDS.length);
    }
  });

  it("has no tags in the texts that are read as plain text: metadata and picture descriptions", () => {
    for (const key of keys.filter((k) => k.startsWith("meta.") || k.startsWith("screenshots."))) {
      for (const locale of LOCALES) {
        const text = key.split(".").reduce<unknown>((n, p) => (n as Record<string, unknown>)[p], MESSAGES[locale]);
        expect(text, `${locale} ${key}`).not.toMatch(/<\/?\w+>/);
      }
    }
  });
});

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return name === "messages" ? [] : sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : [];
  });
}

describe("unused keys", () => {
  // A key counts as used when its full path appears as a string in the source, or when the source
  // builds it from a template literal whose fixed start is a prefix of the key (`faq.items.${id}.q`).
  it("has none: every English key is referenced somewhere in src", () => {
    const source = sourceFiles(SRC).map((f) => readFileSync(f, "utf8")).join("\n");
    const prefixes = [...source.matchAll(/`([\w.-]*\.)\$\{/g)].map((m) => m[1] ?? "");
    const unused = catalogPaths(MESSAGES.en).filter((key) => {
      if (source.includes(`"${key}"`) || source.includes(`'${key}'`) || source.includes(`\`${key}\``)) return false;
      return !prefixes.some((p) => key.startsWith(p));
    });
    expect(unused).toEqual([]);
  });
});
