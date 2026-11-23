import { expect, test, type APIRequestContext } from "@playwright/test";
import { LOCALES, pathOf, SLUGS } from "./helpers";

/** Metadata, structured data and the sitemap, for all pages, checked across pages. */

interface Meta {
  path: string;
  title: string;
  description: string;
  canonical: string;
  alternates: Record<string, string>;
  lang: string;
  ogTitle: string;
  ogDescription: string;
  ld: Record<string, unknown>[];
  questions: string[];
}

const attr = (html: string, pattern: RegExp) => pattern.exec(html)?.[1]?.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'") ?? "";

async function readMeta(request: APIRequestContext, path: string): Promise<Meta> {
  const html = await (await request.get(path)).text();
  const alternates: Record<string, string> = {};
  for (const tag of html.match(/<link[^>]+rel="alternate"[^>]*>/g) ?? []) {
    const lang = attr(tag, /hreflang="([^"]+)"/i);
    if (lang) alternates[lang] = attr(tag, /href="([^"]+)"/);
  }
  return {
    path,
    title: attr(html, /<title>([^<]*)<\/title>/),
    description: attr(html, /<meta name="description" content="([^"]*)"/),
    canonical: attr(html, /<link rel="canonical" href="([^"]+)"/),
    alternates,
    lang: attr(html, /<html[^>]*\blang="([^"]+)"/),
    ogTitle: attr(html, /<meta property="og:title" content="([^"]*)"/),
    ogDescription: attr(html, /<meta property="og:description" content="([^"]*)"/),
    ld: [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1] ?? "{}")),
    questions: [...html.slice(html.indexOf("<main")).matchAll(/<summary[^>]*>([\s\S]*?)<\/summary>/g)].map((m) => (m[1] ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()),
  };
}

const ALL = LOCALES.flatMap((locale) => SLUGS.map((slug) => pathOf(locale, slug)));

test.describe("metadata across pages", () => {
  test("every page has its own title, description, Open Graph text, in its own language", async ({ request }) => {
    const metas = await Promise.all(ALL.map((path) => readMeta(request, path)));
    for (const key of ["title", "description", "ogTitle", "ogDescription"] as const) {
      const values = metas.map((m) => m[key]);
      expect(values.filter((v) => !v), `${key} missing`).toEqual([]);
      const seen = new Map<string, string>();
      for (const m of metas) {
        const clash = seen.get(m[key]);
        expect(clash, `${key} of ${m.path} equals the one of ${clash}`).toBeUndefined();
        seen.set(m[key], m.path);
      }
    }
    for (const m of metas) {
      expect(m.title.length, `${m.path} title`).toBeLessThanOrEqual(70);
      expect(m.description.length, `${m.path} description`).toBeGreaterThanOrEqual(50);
      expect(m.description.length, `${m.path} description`).toBeLessThanOrEqual(175);
      expect(m.lang).toBe(m.path.split("/")[1]);
    }
  });

  test("canonical is the page itself, and hreflang alternates are reciprocal and in the right language", async ({ request }) => {
    const metas = new Map((await Promise.all(ALL.map((path) => readMeta(request, path)))).map((m) => [m.path, m]));
    const origins = new Set<string>();
    for (const m of metas.values()) {
      const canonical = new URL(m.canonical);
      origins.add(canonical.origin);
      expect(canonical.pathname, `${m.path} canonical`).toBe(m.path);
      expect(canonical.search + canonical.hash).toBe("");
      const slug = m.path.split("/").slice(2).join("/");
      expect(Object.keys(m.alternates).sort(), m.path).toEqual(["en", "pl", "x-default"]);
      for (const [hreflang, href] of Object.entries(m.alternates)) {
        const url = new URL(href);
        origins.add(url.origin);
        const target = metas.get(url.pathname);
        expect(target, `${m.path} -> ${hreflang} ${href} is a page of the site`).toBeDefined();
        if (hreflang !== "x-default") expect(target?.lang, `${m.path} -> ${hreflang}`).toBe(hreflang);
        else expect(url.pathname).toBe(pathOf("en", slug));
        // Reciprocity: the target lists this page (same language code) among its own alternates.
        const back = target?.alternates[m.lang];
        expect(back ? new URL(back).pathname : undefined, `${url.pathname} points back to ${m.path}`).toBe(m.path);
        expect(target?.canonical).toBe(href);
      }
    }
    expect([...origins], "one origin everywhere").toHaveLength(1);
  });
});

test.describe("sitemap", () => {
  test("lists exactly the routes, once each, with alternates, and every address answers 200", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const locs = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1] ?? "").pathname);
    expect([...locs].sort()).toEqual([...ALL].sort());
    expect(new Set(locs).size).toBe(locs.length);
    for (const block of xml.match(/<url>[\s\S]*?<\/url>/g) ?? []) {
      const loc = new URL(/<loc>([^<]+)</.exec(block)?.[1] ?? "").pathname;
      const slug = loc.split("/").slice(2).join("/");
      const alternates = [...block.matchAll(/hreflang="([^"]+)"[^>]*href="([^"]+)"/gi)].map((m) => `${m[1]} ${new URL(m[2] ?? "").pathname}`).sort();
      expect(alternates, loc).toEqual([`en ${pathOf("en", slug)}`, `pl ${pathOf("pl", slug)}`, `x-default ${pathOf("en", slug)}`]);
    }
    for (const path of locs) expect((await request.get(path)).status(), path).toBe(200);
  });

  test("no page is noindex, and robots names the sitemap with an absolute address", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/^Sitemap: https?:\/\/\S+\/sitemap\.xml$/m);
    for (const path of ALL) {
      const response = await request.get(path);
      expect(response.headers()["x-robots-tag"], path).toBeUndefined();
      expect(await response.text(), path).not.toMatch(/<meta name="robots" content="[^"]*noindex/);
    }
  });
});

test.describe("structured data", () => {
  const TYPES: Record<string, string[]> = {
    "": ["SoftwareApplication"],
    features: ["BreadcrumbList"],
    "how-it-works": ["BreadcrumbList"],
    pricing: ["BreadcrumbList"],
    about: ["BreadcrumbList", "Person"],
    faq: ["BreadcrumbList", "FAQPage"],
    privacy: ["BreadcrumbList"],
    accessibility: ["BreadcrumbList"],
  };
  const absolute = (value: unknown) => {
    expect(typeof value, String(value)).toBe("string");
    expect(new URL(String(value)).protocol).toMatch(/^https?:$/);
    return new URL(String(value));
  };

  for (const locale of LOCALES) {
    for (const slug of SLUGS) {
      const path = pathOf(locale, slug);
      test(`${path}: JSON-LD parses and is valid for the expected types`, async ({ request }) => {
        const meta = await readMeta(request, path);
        expect(meta.ld.map((d) => d["@type"]).sort(), "types").toEqual([...(TYPES[slug] ?? [])].sort());
        for (const data of meta.ld) {
          expect(data["@context"]).toBe("https://schema.org");
          switch (data["@type"]) {
            case "SoftwareApplication":
              for (const key of ["name", "description", "applicationCategory", "operatingSystem", "url"]) expect(data[key], key).toBeTruthy();
              expect(data.description).toBe(meta.description);
              expect(absolute(data.url).pathname).toBe(path);
              expect(data.offers, "no price is claimed").toBeUndefined();
              expect(data.aggregateRating, "no rating is claimed").toBeUndefined();
              break;
            case "Person": {
              expect(data.name).toBeTruthy();
              absolute(data.url);
              const sameAs = data.sameAs as unknown[];
              expect(sameAs.length).toBeGreaterThan(0);
              sameAs.forEach(absolute);
              break;
            }
            case "BreadcrumbList": {
              const items = data.itemListElement as { "@type": string; position: number; name: string; item: string }[];
              expect(items.map((i) => i.position)).toEqual(items.map((_, i) => i + 1));
              for (const item of items) {
                expect(item["@type"]).toBe("ListItem");
                expect(item.name).toBeTruthy();
                expect(ALL, item.item).toContain(absolute(item.item).pathname);
              }
              expect(absolute(items.at(-1)?.item).pathname, "the last crumb is this page").toBe(path);
              break;
            }
            case "FAQPage": {
              expect(data.inLanguage).toBe(locale);
              const entities = data.mainEntity as { "@type": string; name: string; acceptedAnswer: { "@type": string; text: string } }[];
              expect(entities.length).toBeGreaterThan(0);
              for (const q of entities) {
                expect(q["@type"]).toBe("Question");
                expect(q.acceptedAnswer["@type"]).toBe("Answer");
                expect(q.acceptedAnswer.text.trim()).not.toBe("");
              }
              // The markup states what the page shows: the same questions, in the same order.
              expect(entities.map((q) => q.name.replace(/\s+/g, " ").trim())).toEqual(meta.questions);
              break;
            }
          }
        }
      });
    }
  }
});
