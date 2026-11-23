/** Base64 of 16 random bytes: a fresh value for every request. */
export function createNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCodePoint(...bytes));
}

type CspOptions = {
  nonce: string;
  /** `next dev` needs eval (React debugging) and inline styles (HMR) and a websocket. */
  dev?: boolean;
  /** Send `upgrade-insecure-requests`: only for an https site, localhost over http would break. */
  upgradeInsecure?: boolean;
};

/**
 * The Content-Security-Policy of a page. Scripts: only those with this request's nonce, and what
 * they load ('strict-dynamic', so host lists are ignored). Everything is same-origin: the site
 * uses no third-party scripts, fonts, images or frames, and sends no data anywhere.
 */
export function buildCsp({ nonce, dev = false, upgradeInsecure = false }: CspOptions): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' ${dev ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    // Style attributes (next/image sets one) cannot run script: allowing them keeps style-src strict.
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self'${dev ? " ws: wss:" : ""}`,
    "manifest-src 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "worker-src 'self'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ];
  if (upgradeInsecure) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}
