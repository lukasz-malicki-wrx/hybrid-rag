// Validates the HTML of every page in both languages (lighthouse/pages.json) with html-validate.
//
//   npm run build -w @hybrid-rag/landing && npm run validate:html -w @hybrid-rag/landing
//
// Starts `next start` on the validateHtml port of ports.json unless HTML_VALIDATE_URL points at a running server.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { HtmlValidate } from "html-validate/node";
import { VALIDATE_HTML_PORT as PORT } from "./ports.mjs";

const root = path.resolve(import.meta.dirname, "..");
// The 404 page of each language is validated too (it answers with status 404, but is a page).
const pages = [...JSON.parse(readFileSync(path.join(root, "lighthouse/pages.json"), "utf8")), "/en/no-such-page", "/pl/no-such-page"];
const base = process.env.HTML_VALIDATE_URL ?? `http://localhost:${PORT}`;

async function waitFor(url) {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`${url} did not start`);
}

const server = process.env.HTML_VALIDATE_URL
  ? null
  : spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: root, stdio: "ignore" });
let failed = false;
try {
  await waitFor(`${base}/en`);
  const validator = new HtmlValidate({
    extends: ["html-validate:recommended"],
    rules: {
      // React writes attribute names in camel case (hrefLang, charSet, noModule, fetchPriority):
      // HTML attribute names are case-insensitive, so this is style, not an error, and it is not ours.
      "attr-case": "off",
      // crossorigin="" and hidden="" are valid; React writes them that way.
      "attribute-empty-style": "off",
      "void-style": "off",
      "attribute-boolean-style": "off",
      "no-trailing-whitespace": "off",
      // Next's own bootstrap script has the id "_R_".
      "valid-id": "off",
      // Style attributes come from next/image and the screenshot placeholder (aspect ratio).
      "no-inline-style": "off",
    },
  });
  for (const page of pages) {
    const html = await (await fetch(`${base}${page}`)).text();
    const report = await validator.validateString(html, page);
    const messages = report.results.flatMap((r) => r.messages);
    console.log(`${report.valid ? "ok  " : "FAIL"} ${page}${messages.length ? ` (${messages.length})` : ""}`);
    for (const m of messages) console.log(`     ${m.ruleId} ${m.line}:${m.column} ${m.message}`);
    if (!report.valid) failed = true;
  }
} finally {
  server?.kill();
}
process.exit(failed ? 1 : 0);
