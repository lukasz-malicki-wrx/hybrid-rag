import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { config, proxy } from "./proxy";

const request = (path: string, headers: Record<string, string> = {}) =>
  new NextRequest(`http://localhost${path}`, { headers });

describe("proxy: the root address", () => {
  it("redirects with 307 to the language of Accept-Language", () => {
    const response = proxy(request("/", { "accept-language": "pl-PL,pl;q=0.9" }));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location") ?? "").pathname).toBe("/pl");
    expect(response.headers.get("vary")).toContain("Accept-Language");
  });

  it("defaults to English", () => {
    expect(new URL(proxy(request("/")).headers.get("location") ?? "").pathname).toBe("/en");
    expect(new URL(proxy(request("/", { "accept-language": "de" })).headers.get("location") ?? "").pathname).toBe("/en");
  });
});

describe("proxy: pages", () => {
  it("sets a Content-Security-Policy whose nonce changes with every request", () => {
    const nonceOf = (path: string) => /'nonce-([^']+)'/.exec(proxy(request(path)).headers.get("content-security-policy") ?? "")?.[1];
    const first = nonceOf("/en/pricing");
    expect(first).toBeTruthy();
    expect(first).not.toBe(nonceOf("/en/pricing"));
  });

  it("answers an address outside the languages with the 404 page of the visitor's language", () => {
    const response = proxy(request("/xx/whatever", { "accept-language": "pl" }));
    expect(response.headers.get("x-middleware-rewrite")).toContain("/pl/404");
    expect(response.status).toBe(404);
    expect(response.headers.get("content-security-policy")).toContain("nonce-");
  });

  it("answers an unknown address inside a language with the 404 page of that language, not of the visitor's", () => {
    const response = proxy(request("/en/no-such-page/deeper", { "accept-language": "pl" }));
    expect(response.headers.get("x-middleware-rewrite")).toContain("/en/404");
    expect(response.status).toBe(404);
  });

  it("answers an address that looks like a file with the 404 page", () => {
    const response = proxy(request("/en/x.txt"));
    expect(response.headers.get("x-middleware-rewrite")).toContain("/en/404");
    expect(response.status).toBe(404);
  });

  it("lets every page through, with or without a trailing slash", () => {
    for (const path of ["/en", "/pl/pricing", "/pl/how-it-works/"]) {
      const response = proxy(request(path));
      expect(response.status, path).toBe(200);
      expect(response.headers.get("x-middleware-rewrite"), path).toBeNull();
    }
  });

  it("does not redirect them", () => {
    expect(proxy(request("/en")).status).toBe(200);
  });
});

describe("proxy matcher", () => {
  const [entry] = config.matcher;
  const regex = new RegExp(`^${entry?.source}$`);

  it("matches pages and the root, not build output or files", () => {
    for (const path of ["/", "/en", "/pl/how-it-works", "/xx/unknown"]) expect(regex.test(path), path).toBe(true);
    // An address that only looks like a file is a page that does not exist: it gets the 404 page.
    for (const path of ["/en/x.txt", "/pl/a/b.png", "/x.png"]) expect(regex.test(path), path).toBe(true);
    for (const path of ["/_next/static/chunks/a.js", "/_next/image", "/sitemap.xml", "/robots.txt", "/icon.svg", "/apple-icon", "/en/opengraph-image", "/manifest.webmanifest", "/screenshots/chat-light.png"]) {
      expect(regex.test(path), path).toBe(false);
    }
  });
});
