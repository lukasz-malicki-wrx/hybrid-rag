type HeaderEntry = { key: string; value: string };

const TWO_YEARS = 63_072_000;

/**
 * The response headers that do not depend on the request, for every path including static files.
 * (The CSP is built per request, with a nonce: src/proxy.ts.) No `preload` in HSTS: that is a
 * commitment about the whole domain, for its owner to make.
 */
export function securityHeaders(vercelEnv?: string): HeaderEntry[] {
  const headers: HeaderEntry[] = [
    { key: "Strict-Transport-Security", value: `max-age=${TWO_YEARS}; includeSubDomains` },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    },
    // For browsers that ignore CSP frame-ancestors.
    { key: "X-Frame-Options", value: "DENY" },
  ];
  if (vercelEnv && vercelEnv !== "production") {
    headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
  }
  return headers;
}
