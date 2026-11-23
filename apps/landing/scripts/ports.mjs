// The ports of this app, from one file (ports.json). The development server and the production
// server (`npm run dev`, `npm start`) use "dev", overridable with LANDING_PORT; Playwright and Lighthouse
// use "e2e" (LANDING_E2E_PORT), so they never test a running `next dev` by mistake;
// the checks that start their own server use the next two, so they can run next to it.
import { readFileSync } from "node:fs";
import path from "node:path";

const file = path.resolve(import.meta.dirname, "../ports.json");
const ports = JSON.parse(readFileSync(file, "utf8"));

export const DEV_PORT = Number(process.env.LANDING_PORT ?? ports.dev);
/** The production server that Playwright and Lighthouse start: never the dev server's port. */
export const E2E_PORT = Number(process.env.LANDING_E2E_PORT ?? ports.e2e);
/** The production server that `npm run screenshots` starts. */
export const SCREENSHOTS_PORT = ports.screenshots;
export const VALIDATE_HTML_PORT = ports.validateHtml;
export const CHECK_LINKS_PORT = ports.checkLinks;
