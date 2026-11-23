import { describe, expect, it } from "vitest";
import { breadcrumbList, serializeJsonLd } from "./json-ld";

describe("serializeJsonLd", () => {
  it("adds the schema.org context and is valid JSON", () => {
    const data = JSON.parse(serializeJsonLd({ "@type": "Person", name: "Ada" }));
    expect(data).toEqual({ "@context": "https://schema.org", "@type": "Person", name: "Ada" });
  });

  it("cannot break out of the script element", () => {
    const evil = '</script><script>alert(1)</script><!-- <script>';
    const out = serializeJsonLd({ name: evil });
    expect(out).not.toContain("<");
    expect(JSON.parse(out).name).toBe(evil);
  });

  it("escapes the JavaScript line separators", () => {
    const out = serializeJsonLd({ name: "a\u2028b\u2029c" });
    expect(out).not.toMatch(/[\u2028\u2029]/);
    expect(JSON.parse(out).name).toBe("a\u2028b\u2029c");
  });
});

describe("breadcrumbList", () => {
  it("numbers the items from 1", () => {
    const list = breadcrumbList([
      { name: "Home", url: "https://x.example/en" },
      { name: "FAQ", url: "https://x.example/en/faq" },
    ]);
    expect(list).toEqual({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://x.example/en" },
        { "@type": "ListItem", position: 2, name: "FAQ", item: "https://x.example/en/faq" },
      ],
    });
  });
});
