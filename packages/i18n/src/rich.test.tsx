import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { compareCatalogs } from "./catalog";
import { detectLocale, negotiateLocale } from "./locales";
import { parseRich, richTagNames } from "./rich";
import { createTranslator } from "./translate";

const en = {
  hello: "Hello {name}",
  link: "Read the <a>FAQ</a> or <b>ask <i>us</i></b>.",
  files: { one: "{count} file", other: "{count} files" },
  nested: { deep: "Deep" },
};
const pl = {
  hello: "Cześć {name}",
  link: "Przeczytaj <a>FAQ</a> lub <b>zapytaj <i>nas</i></b>.",
  files: { one: "{count} plik", few: "{count} pliki", many: "{count} plików", other: "{count} pliku" },
  nested: { deep: "Głęboko" },
};

describe("createTranslator", () => {
  const { t, tp } = createTranslator("pl", pl);

  it("fills placeholders and returns an unknown key as it is", () => {
    expect(t("hello", { name: "Ann" })).toBe("Cześć Ann");
    expect(t("nested.deep")).toBe("Głęboko");
    expect(createTranslator("en", en).t("hello")).toBe("Hello {name}");
  });

  it("chooses plural forms for the language", () => {
    expect([1, 3, 5, 22].map((n) => tp("files", n))).toEqual(["1 plik", "3 pliki", "5 plików", "22 pliki"]);
  });

  it("renders tags as the components the caller maps them to, and nothing else", () => {
    const html = renderToStaticMarkup(
      <p>
        {t.rich("link", { a: (c) => <a href="/faq">{c}</a>, b: (c) => <strong>{c}</strong> })}
      </p>,
    );
    expect(html).toBe('<p>Przeczytaj <a href="/faq">FAQ</a> lub <strong>zapytaj nas</strong>.</p>');
  });

  it("never turns text into markup", () => {
    const { t: tt } = createTranslator("en", { x: "<script>alert(1)</script> & <b>{v}</b>" });
    const html = renderToStaticMarkup(<p>{tt.rich("x", { b: (c) => <b>{c}</b> }, { v: "<img src=x>" })}</p>);
    expect(html).not.toContain("<script");
    expect(html).toContain("alert(1)");
    expect(html).toContain("&lt;img src=x&gt;");
    expect(html).not.toContain("<img");
  });
});

describe("parseRich", () => {
  it("keeps unbalanced tags as text", () => {
    expect(renderToStaticMarkup(<p>{createTranslator("en", { x: "a <b>b" }).t.rich("x", {})}</p>)).toBe("<p>a &lt;b&gt;b</p>");
    expect(renderToStaticMarkup(<p>{createTranslator("en", { x: "a </b> b" }).t.rich("x", {})}</p>)).toBe("<p>a &lt;/b&gt; b</p>");
  });
  it("lists the tags used", () => {
    expect(richTagNames("<a>x</a> <b>y <i>z</i></b>")).toEqual(["a", "b", "i"]);
    expect(parseRich("plain")).toEqual([{ kind: "text", text: "plain" }]);
  });
});

describe("compareCatalogs", () => {
  it("accepts a complete translation", () => {
    expect(compareCatalogs(en, pl, "pl")).toEqual([]);
  });

  it("reports missing and extra keys, placeholders, tags, empty texts and plural forms", () => {
    const bad = {
      hello: "Cześć",
      link: "Przeczytaj <a>FAQ</a> lub zapytaj nas",
      files: { one: "{count} plik", other: "{count} pliku" },
      extra: "x",
    };
    expect(compareCatalogs(en, bad, "pl")).toEqual(
      expect.arrayContaining([
        "missing key: nested.deep",
        "extra key: extra",
        "hello: different placeholders",
        "link: different tags",
        'files: missing plural form "few"',
        'files: missing plural form "many"',
      ]),
    );
    expect(compareCatalogs({ a: "x" }, { a: " " }, "en")).toEqual(["a: empty"]);
  });
});

describe("locales", () => {
  const locales = ["en", "pl"] as const;
  it("negotiates Accept-Language by quality, then order; ignores q=0 and regions", () => {
    expect(negotiateLocale(locales, "en", "pl-PL,pl;q=0.9,en-US;q=0.8")).toBe("pl");
    expect(negotiateLocale(locales, "en", "pl;q=0.4,en;q=0.9")).toBe("en");
    expect(negotiateLocale(locales, "en", "pl;q=0,en;q=0.5")).toBe("en");
    expect(negotiateLocale(locales, "en", "de,fr")).toBe("en");
    expect(negotiateLocale(locales, "en", null)).toBe("en");
    expect(negotiateLocale(locales, "en", "pl;q=abc")).toBe("en");
  });
  it("detects from a language list", () => {
    expect(detectLocale(locales, "en", ["de-DE", "pl"])).toBe("pl");
    expect(detectLocale(locales, "en", [])).toBe("en");
  });
});
