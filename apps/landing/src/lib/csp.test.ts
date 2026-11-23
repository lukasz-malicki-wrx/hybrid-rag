import { describe, expect, it } from "vitest";
import { buildCsp, createNonce } from "./csp";

const directive = (csp: string, name: string) => csp.split("; ").find((d) => d.startsWith(`${name} `));

describe("createNonce", () => {
  it("is different every time and valid base64 of 16 bytes", () => {
    const a = createNonce();
    expect(a).not.toBe(createNonce());
    expect(atob(a)).toHaveLength(16);
  });
});

describe("buildCsp", () => {
  const csp = buildCsp({ nonce: "abc123" });

  it("allows scripts only with the nonce, and what they load", () => {
    expect(directive(csp, "script-src")).toBe("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(csp).not.toContain("unsafe-eval");
    expect(directive(csp, "script-src")).not.toContain("unsafe-inline");
  });

  it("keeps styles strict, with style attributes as the one exception", () => {
    expect(directive(csp, "style-src")).toBe("style-src 'self' 'nonce-abc123'");
    expect(directive(csp, "style-src-attr")).toBe("style-src-attr 'unsafe-inline'");
  });

  it("forbids framing, plugins, forms and a changed base URL", () => {
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("form-action 'none'");
    expect(csp).toContain("base-uri 'self'");
  });

  it("names no other origin", () => {
    expect(csp).not.toMatch(/https?:|\*/);
  });

  it("upgrades insecure requests only when asked (an http localhost would break)", () => {
    expect(csp).not.toContain("upgrade-insecure-requests");
    expect(buildCsp({ nonce: "x", upgradeInsecure: true })).toContain("upgrade-insecure-requests");
  });

  it("relaxes only what next dev needs", () => {
    const dev = buildCsp({ nonce: "x", dev: true });
    expect(directive(dev, "script-src")).toContain("'unsafe-eval'");
    expect(directive(dev, "style-src")).toContain("'unsafe-inline'");
    expect(directive(dev, "connect-src")).toContain("ws:");
  });
});
