import path from "node:path";
import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security-headers";

// Packages are installed in the repository root's node_modules, so both the file tracer and
// Turbopack have to look there instead of at this app's directory.
const repoRoot = path.resolve(import.meta.dirname, "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  transpilePackages: ["@hybrid-rag/ui", "@hybrid-rag/i18n", "@hybrid-rag/design-tokens"],
  // The repository is public, so readable stack traces in the browser reveal nothing.
  productionBrowserSourceMaps: true,
  poweredByHeader: false,
  // React would add a `Link: </>; rel=preconnect` header (Next preconnects to its own origin) and one that preloads the
  // font; the same <link> tags are in the HTML. React treats 0 as a mistake and warns in `next dev` on every request, so
  // the shortest allowed length is used: no header is long enough to fit.
  reactMaxHeadersLength: 1,
  // Keep `next dev` from writing extra files into the project tree.
  agentRules: false,
  async headers() {
    // The CSP is not here: it carries a nonce per request and is set by src/proxy.ts.
    return [
      { source: "/:path*", headers: securityHeaders(process.env.VERCEL_ENV) },
      { source: "/:locale(en|pl)/:path*", headers: [{ key: "Cache-Control", value: "private, no-cache" }] },
      { source: "/:locale(en|pl)", headers: [{ key: "Cache-Control", value: "private, no-cache" }] },
    ];
  },
  turbopack: {
    root: repoRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
