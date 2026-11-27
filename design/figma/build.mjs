#!/usr/bin/env node
/**
 * Builds the Figma plugin that draws hybrid-rag's design system, landing page and app.
 *
 * Everything the plugin draws comes from the code: colours from packages/design-tokens, the type
 * scale from packages/ui and the landing stylesheet, texts from the i18n catalogs, icons from the
 * icon set of packages/ui, pictures from the landing screenshots. This script reads them into
 * src/generated/data.js, then bundles src/main.js into dist/code.js (one file, as Figma wants).
 *
 *   node design/figma/build.mjs [--locale=en|pl]
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const require = createRequire(path.join(root, "packages/ui/package.json"));
const locale = (process.argv.find((a) => a.startsWith("--locale=")) ?? "--locale=en").split("=")[1];

const read = (p) => readFile(path.join(root, p), "utf8");

// ---------------------------------------------------------------------------------------------
// Colours: palette primitives (light and dark value of each), then the role colours of theme.css.

async function colours() {
  const css = await read("packages/design-tokens/src/palettes/vintage.css");
  const primitives = {};
  for (const m of css.matchAll(/--([a-z0-9-]+):\s*light-dark\((#[0-9a-f]{3,8}),\s*(#[0-9a-f]{3,8})\)/gi)) {
    primitives[m[1]] = { light: m[2].toLowerCase(), dark: m[3].toLowerCase() };
  }
  const theme = await read("packages/design-tokens/src/theme.css");
  // --color-name: var(--x)  or  --color-name: light-dark(var(--a), var(--b))
  const roles = {};
  for (const m of theme.matchAll(/--color-([a-z0-9-]+):\s*([^;]+);/gi)) {
    const value = m[2].trim();
    const ld = value.match(/^light-dark\(var\(--([a-z0-9-]+)\),\s*var\(--([a-z0-9-]+)\)\)$/);
    const one = value.match(/^var\(--([a-z0-9-]+)\)$/);
    if (ld) roles[m[1]] = { light: ld[1], dark: ld[2] };
    else if (one) roles[m[1]] = { light: one[1], dark: one[1] };
    else throw new Error(`theme.css: cannot read --color-${m[1]}: ${value}`);
  }
  for (const [name, r] of Object.entries(roles)) {
    if (!primitives[r.light] || !primitives[r.dark]) throw new Error(`role ${name} points to a missing primitive`);
  }
  return { primitives, roles };
}

// ---------------------------------------------------------------------------------------------
// Type scale. App sizes are Tailwind's (packages/ui heading.tsx / text.tsx); landing sizes are the
// fluid clamp() values of apps/landing globals.css, evaluated at the phone (375) and design (1440)
// widths.

function clampAt(expr, vw) {
  const m = expr.match(/clamp\(([\d.]+)rem,\s*([\d.]+)rem\s*\+\s*([\d.]+)vw,\s*([\d.]+)rem\)/);
  if (!m) throw new Error(`cannot read clamp: ${expr}`);
  const [min, base, slope, max] = m.slice(1).map(Number);
  const px = base * 16 + (slope / 100) * vw;
  return Math.round(Math.min(max * 16, Math.max(min * 16, px)));
}

async function landingScale() {
  const css = await read("apps/landing/src/app/globals.css");
  const get = (name) => {
    const m = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
    if (!m) throw new Error(`globals.css: --${name} missing`);
    return m[1].trim();
  };
  const scale = {};
  for (const name of ["h1", "h2", "h3", "lead", "eyebrow", "stat"]) {
    const size = get(`text-${name}`);
    const lh = Number(get(`text-${name}--line-height`));
    const lsMatch = css.match(new RegExp(`--text-${name}--letter-spacing:\\s*(-?[\\d.]+)em`));
    scale[name] = {
      desktop: clampAt(size, 1440),
      mobile: clampAt(size, 375),
      lineHeight: lh,
      letterSpacing: lsMatch ? Number(lsMatch[1]) * 100 : 0, // percent, as Figma wants
    };
  }
  const spacing = {};
  for (const name of ["section", "section-tight", "heading"]) {
    const v = get(`spacing-${name}`);
    spacing[name] = { desktop: clampAt(v, 1440), mobile: clampAt(v, 375) };
  }
  spacing.gutter = { desktop: 24, mobile: 24 };
  return { scale, spacing, containerPage: 78 * 16 };
}

// ---------------------------------------------------------------------------------------------
// Texts: the app catalog (TypeScript, read through jiti) and the landing JSON files.

async function texts() {
  const { createJiti } = await import(require.resolve("jiti"));
  const jiti = createJiti(import.meta.url);
  const webModule = await jiti.import(path.join(root, `apps/web/src/i18n/messages/${locale}.ts`));
  const web = webModule[locale] ?? webModule.default;
  if (!web) throw new Error(`apps/web catalog for ${locale} not found`);
  const landing = {};
  const dir = path.join(root, `apps/landing/src/messages/${locale}`);
  for (const file of await readdir(dir)) {
    if (file.endsWith(".json")) landing[file.replace(/\.json$/, "")] = JSON.parse(await readFile(path.join(dir, file), "utf8"));
  }
  // Numbers, the author and the quick-start commands the landing texts quote (not translated).
  const facts = await jiti.import(path.join(root, "apps/landing/src/config/facts.ts"));
  const site = await jiti.import(path.join(root, "apps/landing/src/config/site.ts"));
  const commands = await jiti.import(path.join(root, "apps/landing/src/sections/how-it-works/commands.ts"));
  const config = {
    facts: facts.factParams(locale),
    author: site.SITE.author.name,
    startCommand: commands.START_COMMAND,
    seedCommand: commands.SEED_COMMAND,
  };
  return { locale, web, landing, config };
}

// ---------------------------------------------------------------------------------------------
// Icons: every icon packages/ui exports, rendered to SVG with the app's defaults (stroke 1.75).

async function icons() {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const lucide = require("lucide-react");
  const simple = require("simple-icons");
  const glyphs = await read("packages/ui/src/icons/glyphs.ts");
  const exportBlock = glyphs.match(/export\s*\{([\s\S]*?)\}\s*from\s*"lucide-react"/);
  if (!exportBlock) throw new Error("glyphs.ts: lucide export block not found");
  const out = {};
  for (const raw of exportBlock[1].split(",")) {
    const item = raw.replace(/\/\/.*$/gm, "").trim();
    if (!item) continue;
    const [source, alias] = item.split(/\s+as\s+/).map((s) => s.trim());
    const Comp = lucide[source];
    if (!Comp) throw new Error(`lucide-react has no ${source}`);
    out[alias ?? source] = renderToStaticMarkup(
      React.createElement(Comp, { width: 24, height: 24, strokeWidth: 1.75, color: "#000000" }),
    );
  }
  const brands = { Claude: "siClaude", Postgres: "siPostgresql", Ollama: "siOllama", FastApi: "siFastapi", NextJs: "siNextdotjs" };
  for (const [name, key] of Object.entries(brands)) {
    out[name] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#000000"><path d="${simple[key].path}"/></svg>`;
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Screenshots: WebP is not a format Figma reads, so they become JPEG (at most 1440 px wide, to keep
// the plugin small; they are pictures inside cards, never shown at full size).

async function screenshots() {
  const sharp = require("sharp");
  const dir = path.join(root, "apps/landing/public/screenshots");
  const out = {};
  for (const file of (await readdir(dir)).sort()) {
    if (!file.endsWith(".webp")) continue;
    const jpg = await sharp(path.join(dir, file)).resize({ width: 1440, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    const meta = await sharp(jpg).metadata();
    out[file.replace(/\.webp$/, "")] = { width: meta.width, height: meta.height, base64: jpg.toString("base64") };
  }
  return out;
}

// ---------------------------------------------------------------------------------------------

async function main() {
  const data = {
    colours: await colours(),
    landing: await landingScale(),
    texts: await texts(),
    icons: await icons(),
    screenshots: await screenshots(),
  };
  const generated = path.join(here, "src/generated");
  await mkdir(generated, { recursive: true });
  await writeFile(path.join(generated, "data.js"), `// Generated by build.mjs. Do not edit.\nexport const DATA = ${JSON.stringify(data)};\n`);

  const { build } = await import(require.resolve("vite"));
  await build({
    root: here,
    logLevel: "warn",
    configFile: false,
    build: {
      outDir: path.join(here, "dist"),
      emptyOutDir: true,
      target: "es2017",
      minify: false,
      lib: { entry: path.join(here, "src/main.js"), formats: ["iife"], name: "hybridRagFigma", fileName: () => "code.js" },
    },
  });
  const counts = `${Object.keys(data.icons).length} icons, ${Object.keys(data.screenshots).length} screenshots, locale ${locale}`;
  console.log(`design/figma/dist/code.js built (${counts})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
