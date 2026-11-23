import { describe, expect, it } from "vitest";
import { securityHeaders } from "./security-headers";

const value = (headers: ReturnType<typeof securityHeaders>, key: string) => headers.find((h) => h.key === key)?.value;

describe("securityHeaders", () => {
  const headers = securityHeaders();

  it("sets HSTS, COOP, nosniff, Referrer-Policy and Permissions-Policy", () => {
    expect(value(headers, "Strict-Transport-Security")).toMatch(/^max-age=\d+; includeSubDomains$/);
    expect(value(headers, "Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(value(headers, "X-Content-Type-Options")).toBe("nosniff");
    expect(value(headers, "Referrer-Policy")).toBeTruthy();
    expect(value(headers, "Permissions-Policy")).toContain("camera=()");
  });

  it("does not commit the domain to the HSTS preload list", () => {
    expect(value(headers, "Strict-Transport-Security")).not.toContain("preload");
  });

  it("marks everything but production as noindex", () => {
    expect(value(headers, "X-Robots-Tag")).toBeUndefined();
    expect(value(securityHeaders("production"), "X-Robots-Tag")).toBeUndefined();
    expect(value(securityHeaders("preview"), "X-Robots-Tag")).toBe("noindex, nofollow");
  });
});
