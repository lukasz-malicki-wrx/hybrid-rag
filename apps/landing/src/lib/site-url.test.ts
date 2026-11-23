import ports from "../../ports.json";
import { describe, expect, it } from "vitest";
import { absoluteUrl, isIndexable, siteUrl } from "./site-url";

describe("siteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL, then the Vercel production host, then localhost", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://a.example", VERCEL_PROJECT_PRODUCTION_URL: "b.example" })).toBe(
      "https://a.example",
    );
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "b.example" })).toBe("https://b.example");
    expect(siteUrl({})).toBe(`http://localhost:${ports.dev}`);
  });

  it("drops a trailing slash and any path", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://a.example/" })).toBe("https://a.example");
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://a.example/en/" })).toBe("https://a.example");
  });

  it("ignores empty values", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: " ", VERCEL_PROJECT_PRODUCTION_URL: "" })).toBe(`http://localhost:${ports.dev}`);
  });
});

describe("isIndexable", () => {
  it("is true locally and in production, false on previews", () => {
    expect(isIndexable({})).toBe(true);
    expect(isIndexable({ VERCEL_ENV: "production" })).toBe(true);
    expect(isIndexable({ VERCEL_ENV: "preview" })).toBe(false);
    expect(isIndexable({ VERCEL_ENV: "development" })).toBe(false);
  });
});

describe("absoluteUrl", () => {
  it("joins the site address and a path", () => {
    expect(absoluteUrl("/en/faq", { NEXT_PUBLIC_SITE_URL: "https://a.example" })).toBe("https://a.example/en/faq");
  });
});
