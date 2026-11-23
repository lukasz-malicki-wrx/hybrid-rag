import ports from "../../ports.json";

const LOCAL_URL = `http://localhost:${ports.dev}`;

type Env = Record<string, string | undefined>;

/**
 * The public address of the site, with no trailing slash: NEXT_PUBLIC_SITE_URL, else the
 * production domain Vercel exposes (VERCEL_PROJECT_PRODUCTION_URL, a bare host), else localhost.
 * Canonical links, hreflang, the sitemap and Open Graph URLs are built from it.
 */
export function siteUrl(env: Env = process.env): string {
  const configured = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return new URL(configured).origin;
  const vercelHost = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelHost) return new URL(`https://${vercelHost}`).origin;
  return LOCAL_URL;
}

/** Only production deployments may be indexed: Vercel previews (and local runs on Vercel's `dev`) are not. */
export function isIndexable(env: Env = process.env): boolean {
  return !env.VERCEL_ENV || env.VERCEL_ENV === "production";
}

/** "/en/pricing" to "https://example.com/en/pricing". */
export function absoluteUrl(path: string, env: Env = process.env): string {
  return `${siteUrl(env)}${path}`;
}
