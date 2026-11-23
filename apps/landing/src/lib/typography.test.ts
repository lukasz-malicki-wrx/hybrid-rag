import { describe, expect, it } from "vitest";
import { keepEmailTogether, mapTexts, polishTypography } from "./typography";

const NBSP = " ";

describe("polishTypography", () => {
  it("joins one-letter words to the next word", () => {
    expect(polishTypography("Pytaj o dokumenty i sprawdzaj w PDF-ach z cytatami.")).toBe(
      `Pytaj o${NBSP}dokumenty i${NBSP}sprawdzaj w${NBSP}PDF-ach z${NBSP}cytatami.`,
    );
  });

  it("handles a word at the start, capitals, quotes and brackets, and runs of short words", () => {
    expect(polishTypography("W domu")).toBe(`W${NBSP}domu`);
    expect(polishTypography("(a potem „o czym”")).toBe(`(a${NBSP}potem „o${NBSP}czym”`);
    expect(polishTypography("a w a o")).toBe(`a${NBSP}w${NBSP}a${NBSP}o`);
  });

  it("leaves longer words, letters inside words, and other letters alone", () => {
    expect(polishTypography("Ala ma kota, na dole")).toBe("Ala ma kota, na dole");
    expect(polishTypography("kasa i")).toBe("kasa i");
    expect(polishTypography("to jest s tym")).toBe("to jest s tym");
  });

  it("keeps e-mail in one piece", () => {
    expect(polishTypography("Nie ma tu e-maila, tylko adres e-mail.")).toBe("Nie ma tu e\u2011maila, tylko adres e\u2011mail.");
  });

  it("keeps e-mail in one piece in English too", () => {
    expect(keepEmailTogether("There is no e-mail address, and no E-mails either.")).toBe("There is no e\u2011mail address, and no E\u2011mails either.");
    expect(keepEmailTogether("o x")).toBe("o x");
  });

  it("does not touch tags, placeholders or URLs", () => {
    const text = "Zobacz <a>FAQ</a> lub <b>zob. {count} plikach</b> na https://x.pl/a b";
    expect(polishTypography(text)).toBe(text);
    expect(polishTypography("<a>o czym</a>")).toBe("<a>o czym</a>");
    expect(polishTypography("{a} i {b}")).toBe(`{a} i${NBSP}{b}`);
  });

  it("works inside a rich text, after a tag's text and before one", () => {
    expect(polishTypography("Przeczytaj o <a>FAQ</a> i <b>w nim</b>")).toBe(
      `Przeczytaj o${NBSP}<a>FAQ</a> i${NBSP}<b>w nim</b>`,
    );
  });
});

describe("mapTexts", () => {
  it("transforms every text, plural forms too, and skips the named namespaces", () => {
    const out = mapTexts(
      { a: { b: "o x", n: { one: "w {count}", other: "z {count}" } }, meta: { t: "o x" } },
      polishTypography,
      ["meta"],
    );
    expect(out).toEqual({
      a: { b: `o${NBSP}x`, n: { one: `w${NBSP}{count}`, other: `z${NBSP}{count}` } },
      meta: { t: "o x" },
    });
  });
});

describe("getTranslator", () => {
  it("applies it to Polish texts and not to English or to the metadata", async () => {
    const { getTranslator } = await import("./translator");
    const pl = getTranslator("pl").t;
    const text = pl("home.hero.lead");
    expect(text).not.toMatch(/(^|\s)[aiouwzAIOUWZ] /);
    expect(text).toContain(NBSP);
    expect(pl("meta.home.description")).not.toContain(NBSP);
    expect(getTranslator("en").t("home.hero.lead")).not.toContain(NBSP);
    expect(getTranslator("en").t("about.author.contact")).toContain("e\u2011mail");
  });
});
