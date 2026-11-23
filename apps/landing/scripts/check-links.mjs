// Link checker for the built site, no dependencies.
//
//   npm run build -w @hybrid-rag/landing && npm run check:links -w @hybrid-rag/landing
//
// Checks, on every page of lighthouse/pages.json and on the three 404 pages:
//   - every internal link, image, stylesheet and script answers 200 (a path outside the site is an error);
//   - every #fragment, same page or other page, is an id (or name) in the target page;
//   - every link into the repository on GitHub (blob/tree/raw of the main branch) points at a file
//     that `git ls-files` contains (so a file that is only on this machine is a dead link on GitHub).
// `--external` also requests every other https address once (needs the network; off by default,
// because CI must not fail on somebody else's outage). Starts `next start` on the checkLinks port of ports.json unless
// CHECK_LINKS_URL points at a running server.
import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { CHECK_LINKS_PORT as PORT } from "./ports.mjs";

const root = path.resolve(import.meta.dirname, "..");
const repoRoot = path.resolve(root, "../..");
const base = process.env.CHECK_LINKS_URL ?? `http://localhost:${PORT}`;
const REPO = "https://github.com/lukasz-malicki-wrx/hybrid-rag";
const pages = JSON.parse(readFileSync(path.join(root, "lighthouse/pages.json"), "utf8"));
const NOT_FOUND_PAGES = ["/en/does-not-exist", "/pl/does-not-exist", "/xx/does-not-exist"];

/**
 * KNOWN ISSUE, listed on purpose and not hidden: the docs/ folder is not tracked by git yet, so every
 * link to a file in it is a 404 on GitHub today. The links stay (the files are meant to be published);
 * once `git ls-files docs` lists the files, this check fails until the entry is removed, so the
 * exception cannot outlive the problem.
 */
const KNOWN_UNTRACKED = ["docs/"];

const tracked = new Set(spawnSync("git", ["ls-files"], { cwd: repoRoot, encoding: "utf8" }).stdout.split("\n").filter(Boolean));
const isTracked = (file) => tracked.has(file) || [...tracked].some((t) => t.startsWith(`${file.replace(/\/$/, "")}/`));

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

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");
const htmlCache = new Map();
async function html(pathname) {
  if (!htmlCache.has(pathname)) {
    const response = await fetch(base + pathname, { redirect: "manual" });
    htmlCache.set(pathname, { status: response.status, body: response.headers.get("content-type")?.includes("html") ? await response.text() : "" });
  }
  return htmlCache.get(pathname);
}
const idsOf = (body) => new Set([...body.matchAll(/\s(?:id|name)="([^"]+)"/g)].map((m) => decode(m[1])));

function references(body) {
  const found = [];
  for (const m of body.matchAll(/<(a|link|img|script|source)\b[^>]*>/gi)) {
    const tag = m[0];
    const kind = m[1].toLowerCase();
    if (kind === "link" && /rel="(preconnect|dns-prefetch)"/.test(tag)) continue;
    if (kind === "link" && /rel="alternate"/.test(tag)) continue; // hreflang: checked by the e2e tests
    const attribute = kind === "a" || kind === "link" ? "href" : "src";
    const value = new RegExp(`\\s${attribute}="([^"]*)"`, "i").exec(tag)?.[1];
    if (value) found.push({ kind, url: decode(value) });
    // srcset of next/image: the first address of each candidate
    for (const set of tag.matchAll(/\ssrcset="([^"]*)"/gi)) {
      for (const candidate of decode(set[1]).split(",")) found.push({ kind: "img", url: candidate.trim().split(/\s+/)[0] });
    }
  }
  return found.filter((r) => r.url && !/^(mailto:|tel:|data:|javascript:)/.test(r.url));
}

const errors = [];
const known = new Set();
const external = new Set();
let checked = 0;

async function checkInternal(from, pathname, hash, kind, search = "") {
  checked++;
  const target = pathname || from;
  if (kind === "a" || kind === "link") {
    const page = await html(target);
    // An <a> to a page must find it; a 404 page counts as a failure unless it is one of the 404s under test.
    if (page.status !== 200 && !NOT_FOUND_PAGES.includes(target)) errors.push(`${from}: ${target} answers ${page.status}`);
    else if (hash && page.body && !idsOf(page.body).has(decodeURIComponent(hash))) errors.push(`${from}: ${target}#${hash} has no such id`);
    else if (hash && !page.body && page.status === 200) errors.push(`${from}: ${target}#${hash}: the target is not an HTML page`);
  } else {
    // Assets keep their query: /_next/image answers 400 without url, w and q.
    const response = await fetch(base + target + search, { method: "GET" });
    if (response.status !== 200) errors.push(`${from}: ${kind} ${target} answers ${response.status}`);
    await response.arrayBuffer();
  }
}

function checkRepository(from, url) {
  const m = /^https:\/\/github\.com\/lukasz-malicki-wrx\/hybrid-rag\/(blob|tree|raw)\/main\/([^#?]+)/.exec(url);
  if (!m) return;
  checked++;
  const file = decodeURIComponent(m[2]);
  if (isTracked(file)) {
    if (KNOWN_UNTRACKED.some((prefix) => file.startsWith(prefix))) errors.push(`${from}: ${file} is tracked now: remove "${KNOWN_UNTRACKED.find((p) => file.startsWith(p))}" from KNOWN_UNTRACKED in scripts/check-links.mjs`);
    return;
  }
  const prefix = KNOWN_UNTRACKED.find((p) => file.startsWith(p));
  if (prefix) known.add(`${file} (linked from ${from})`);
  else errors.push(`${from}: ${url} points at a file git does not track (${file})`);
}

const server = process.env.CHECK_LINKS_URL ? null : spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: root, stdio: "ignore" });
try {
  await waitFor(`${base}/en`);
  for (const page of [...pages, ...NOT_FOUND_PAGES]) {
    const { body, status } = await html(page);
    if (status !== 200 && !NOT_FOUND_PAGES.includes(page)) errors.push(`${page} answers ${status}`);
    for (const { kind, url } of references(body)) {
      if (url.startsWith("#")) {
        checked++;
        if (url !== "#" && !idsOf(body).has(decodeURIComponent(url.slice(1)))) errors.push(`${page}: ${url} has no such id`);
        continue;
      }
      const parsed = new URL(url, base + page);
      if (parsed.origin === new URL(base).origin) await checkInternal(page, parsed.pathname.replace(/(.)\/$/, "$1"), parsed.hash.slice(1), kind, parsed.search);
      else if (parsed.href.startsWith(REPO)) checkRepository(page, parsed.href);
      else if (kind === "a") external.add(parsed.href.split("#")[0]);
    }
    // Links to the repository can also be on pages that reach the same URL: check them, then the rest.
    for (const m of body.matchAll(/href="(https:\/\/github\.com\/[^"]+)"/g)) checkRepository(page, decode(m[1]));
  }
  if (process.argv.includes("--external")) {
    for (const url of external) {
      let response = await fetch(url, { method: "HEAD", redirect: "follow" }).catch(() => null);
      if (!response || response.status >= 400) response = await fetch(url, { redirect: "follow" }).catch(() => null);
      if (!response || response.status >= 400) errors.push(`external ${url} answers ${response?.status ?? "nothing"}`);
    }
  }
} finally {
  server?.kill();
}

console.log(`${checked} internal and repository links checked on ${pages.length + NOT_FOUND_PAGES.length} pages; ${external.size} other addresses${process.argv.includes("--external") ? " requested" : " listed, not requested"}.`);
for (const url of [...external].sort()) console.log(`  other: ${url}`);
if (known.size) {
  console.log(`\nKNOWN ISSUE (not failing): ${known.size} link(s) into docs/, which git does not track, so GitHub answers 404:`);
  for (const k of [...known].sort()) console.log(`  ${k}`);
}
if (errors.length) {
  console.log("\nFAIL");
  for (const e of [...new Set(errors)]) console.log(`  ${e}`);
}
process.exit(errors.length ? 1 : 0);
