/**
 * How it works: apps/landing/src/app/[locale]/how-it-works/page.tsx and sections/how-it-works/*.
 * Intro, Flows, Ingest, Search, Fusion, Gate, Answer, StoredRecord, Run, Start, Limits, More.
 */
import { instance } from "../../lib/components.js";
import { add, frame, size } from "../../lib/layout.js";
import { icon } from "../../lib/icons.js";
import { layoutSpace } from "../../lib/tokens.js";
import { tl } from "../../lib/text.js";
import { card, messageParams, facts, SEED_COMMAND, START_COMMAND } from "../../components/landing/shared.js";
import { addInstance, addPara, arrowDown, block, bullet, columns, grid, heading, pageFrame, para, section } from "./kit.js";

const H = "howItWorks";

/** The heading of a section followed by its content: the gap between them is --spacing-heading. */
function headed(parent, bp, o = {}) {
  const s = section(parent, bp, o);
  layoutSpace(s.inner, "itemSpacing", "heading", bp);
  return s;
}

function heading_(parent, bp, key, o = {}) {
  return addInstance(
    parent,
    "SectionHeading",
    {
      breakpoint: bp,
      align: o.align || "start",
      level: "2",
      Eyebrow: tl(H, `${key}.eyebrow`),
      Title: tl(H, `${key}.title`),
      "Show lead": !!o.lead,
      ...(o.lead ? { Lead: o.lead } : {}),
    },
    { fill: o.align !== "center" },
  );
}

// ---------------------------------------------------------------------------------------------

const INGEST = [
  ["upload", "File"],
  ["cut", "Search"],
  ["embed", "Bolt"],
  ["store", "Check"],
];
const ASK = [
  ["question", "Chat"],
  ["search", "Search"],
  ["merge", "Refresh"],
  ["gate", "Alert"],
  ["write", "Sparkles"],
  ["save", "Check"],
];

async function flowDiagram(parent, bp, label, group, steps) {
  const f = facts();
  const fig = frame("Flow", { dir: "col", gap: 16, w: "fill" });
  add(parent, fig);
  add(fig, await para(label, bp, { style: "App/Body Semibold", muted: true }));
  const desktop = bp === "desktop";
  const flow = frame("Steps", { dir: desktop ? "row" : "col", w: "fill" });
  add(fig, flow);
  steps.forEach(([id, ic], i) => {
    const c = instance("FlowStepCard", {
      background: "surface",
      Number: String(i + 1),
      Title: tl(H, `flows.${group}.steps.${id}.title`),
      Text: tl(H, `flows.${group}.steps.${id}.text`, f),
      Icon: ic,
    });
    add(flow, c);
    size(c, "fill", desktop ? "fill" : undefined);
    if (i < steps.length - 1) {
      // The arrow between two boxes: 20px wide in the gap of a row, 36px high in the gap of a column.
      const slot = frame("Arrow", { dir: "row", align: "center", justify: "center", w: desktop ? 20 : "fill", h: desktop ? undefined : 36 });
      add(flow, slot);
      if (desktop) size(slot, 20, "fill");
      add(slot, desktop ? icon("ArrowRight", 20, "muted", "Arrow") : arrowDown(20));
    }
  });
}

async function flows(parent, bp) {
  const { inner } = headed(parent, bp, { name: "Flows", align: "center" });
  heading_(inner, bp, "flows", { align: "center", lead: tl(H, "flows.lead") });
  const col = frame("Diagrams", { dir: "col", gap: 56, w: "fill" });
  add(inner, col);
  await flowDiagram(col, bp, tl(H, "flows.ingest.label"), "ingest", INGEST);
  await flowDiagram(col, bp, tl(H, "flows.ask.label"), "ask", ASK);
}

async function stepList(parent, bp, ids) {
  const f = facts();
  const list = frame("Steps", { dir: "col", w: "fill" });
  add(parent, list);
  ids.forEach((id, i) => {
    const s = instance("StepListItem", {
      connector: i < ids.length - 1 ? "true" : "false",
      Number: String(i + 1),
      Title: tl(H, `ingest.steps.${id}.title`),
      Text: tl(H, `ingest.steps.${id}.text`, f),
    });
    add(list, s);
    size(s, "fill");
  });
}

async function ingest(parent, bp) {
  const desktop = bp === "desktop";
  const { inner } = section(parent, bp, { tone: "panel", name: "Ingest", gap: desktop ? undefined : 40 });
  const picture = instance("ShotFrame", { shot: "document", breakpoint: bp, bleed: "false", "Show caption": true, Caption: tl(H, "ingest.caption") });
  const text1 = frame("Text", { dir: "col", w: "fill" });
  const head = block(text1, bp, 0, { name: "Heading" });
  addInstance(head, "SectionHeading", { breakpoint: bp, align: "start", level: "2", Eyebrow: tl(H, "ingest.eyebrow"), Title: tl(H, "ingest.title"), "Show lead": true, Lead: tl(H, "ingest.lead") }, { fill: true });
  const steps = block(text1, bp, 40, { name: "Step list" }); // mb-10
  await stepList(steps, bp, ["save", "read", "cut", "embed", "store"]);
  if (desktop) {
    const split = columns(inner, 120, { name: "Split", align: "start" });
    add(split, picture);
    add(split, text1);
    size(picture, "fill");
    size(text1, "fill");
  } else {
    add(inner, picture);
    add(inner, text1);
  }
}

async function search(parent, bp) {
  const { inner } = headed(parent, bp, { name: "Search", align: "center" });
  heading_(inner, bp, "search", { align: "center", lead: tl(H, "search.lead", facts()) });
  const cards = [
    ["meaning", "Sparkles"],
    ["words", "Search"],
  ].map(([kind, ic]) =>
    instance("FeatureCard", {
      breakpoint: bp,
      background: "surface",
      Title: tl(H, `search.kinds.${kind}.title`),
      Text: tl(H, `search.kinds.${kind}.text`),
      "Show link": false,
      Icon: ic,
    }),
  );
  grid(inner, bp, cards, { cols: bp === "desktop" ? 2 : 1, gap: 20, maxW: 896 });
}

async function fusion(parent, bp) {
  const desktop = bp === "desktop";
  const { inner } = section(parent, bp, { tone: "panel", name: "Fusion" });
  const picture = instance("ShotFrame", { shot: "search-lab", breakpoint: bp, bleed: "false", "Show caption": true, Caption: tl(H, "search.caption") });
  const text1 = frame("Text", { dir: "col", w: "fill" });
  add(text1, await heading(tl(H, "search.fusion.title"), bp, "h2"));
  const lead = block(text1, bp, 16, { name: "Lead" });
  await addPara(lead, tl(H, "search.fusion.text"), bp, { size: "lead", muted: true });
  const label = block(text1, bp, 24, { name: "Formula label" });
  await addPara(label, tl(H, "search.fusion.formulaLabel"), bp, { style: "App/Body Medium", muted: true });
  const formulaWrap = block(text1, bp, 6, { name: "Formula" });
  const formula = card("Formula card", { pad: [12, 16], w: "fill", bg: "raised" });
  add(formula, await para(tl(H, "search.fusion.formula", { k: "60" }), bp, { style: "App/Heading MD" }));
  add(formulaWrap, formula);
  const traceable = block(text1, bp, 24, { name: "Traceable" });
  await addPara(traceable, tl(H, "search.fusion.traceable"), bp);
  if (desktop) {
    const split = columns(inner, 120, { name: "Split", align: "start" });
    add(split, text1);
    add(split, picture);
    size(text1, "fill");
    size(picture, "fill");
  } else {
    const split = frame("Split", { dir: "col", gap: 40, w: "fill" });
    add(inner, split);
    add(split, picture);
    add(split, text1);
  }

  // The worked example: the explanation beside the table.
  const example = frame("Worked example", { dir: desktop ? "row" : "col", gap: desktop ? 120 : 40, w: "fill", align: "start" });
  layoutSpace(example, "paddingTop", "section", bp);
  add(inner, example);
  const left = frame("Explanation", { dir: "col", w: "fill" });
  add(example, left);
  size(left, "fill");
  add(left, await heading(tl(H, "search.fusion.exampleTitle"), bp, "h3"));
  for (const key of ["exampleText", "reading"]) {
    const b = block(left, bp, 16, { name: key });
    await addPara(b, tl(H, `search.fusion.${key}`), bp);
  }
  const num = (x) => x.toFixed(4);
  const first = block(left, bp, 16, { name: "First row" });
  await addPara(
    first,
    tl(H, "search.fusion.firstRow", { meaning: "1", words: "3", left: num(1 / 61), right: num(1 / 63), total: num(1 / 61 + 1 / 63) }),
    bp,
    { size: "sm", muted: true },
  );
  const table = instance("FusionTable", { breakpoint: bp });
  add(example, table);
  size(table, "fill");
}

async function gate(parent, bp) {
  const desktop = bp === "desktop";
  const f = facts();
  const { inner } = section(parent, bp, { name: "Gate" });
  const head = block(inner, bp, 0, { name: "Heading" });
  addInstance(head, "SectionHeading", { breakpoint: bp, align: "start", level: "2", Eyebrow: tl(H, "gate.eyebrow"), Title: tl(H, "gate.title"), "Show lead": true, Lead: tl(H, "gate.lead") }, { fill: true });
  layoutSpace(head, "paddingBottom", "heading", bp);
  await addPara(inner, tl(H, "gate.passes"), bp, { style: "App/Heading SM" });
  const rules = block(inner, bp, 16, { name: "Rules" });
  const rows = [];
  for (const key of ["distance", "words"]) {
    const c = card("Rule", { pad: 24, w: "fill", bg: "surface" });
    add(c, await para(tl(H, `gate.rules.${key}`, f), bp));
    rows.push(c);
  }
  grid(rules, bp, rows, { cols: desktop ? 2 : 1, gap: 20 });
  const otherwise = block(inner, bp, 32, { name: "Otherwise" });
  const row = frame("Otherwise", { dir: "row", gap: 12, w: "fill" });
  row.maxWidth = 512;
  const iconWrap = frame("Icon", { dir: "col", pad: [2, 0, 0, 0] });
  add(iconWrap, icon("Alert", 22, "muted", "Icon"));
  add(row, iconWrap);
  add(row, await para(tl(H, "gate.otherwise"), bp));
  add(otherwise, row);
  const measured = block(inner, bp, "section", { name: "Measured" });
  const mt = frame("Title", { dir: "col", pad: [0, 0, 24, 0], w: "fill" });
  add(mt, await heading(tl(H, "gate.measured.title"), bp, "h3"));
  add(measured, mt);
  addInstance(measured, "StatBand", {
    breakpoint: bp,
    stats: "3",
    "Value 1": f.nearestAnswerable,
    "Label 1": tl(H, "gate.stats.answerable"),
    "Value 2": f.nearestOffTopic,
    "Label 2": tl(H, "gate.stats.offTopic", f),
    "Value 3": f.gateDistance,
    "Label 3": tl(H, "gate.stats.threshold"),
  }, { fill: true });
  const text1 = block(measured, bp, 32, { name: "Text" });
  await addPara(text1, tl(H, "gate.measured.text", f), bp, { max: 512 });
  const limit = block(measured, bp, 12, { name: "Limit" });
  await addPara(limit, tl(H, "gate.measured.limit"), bp, { size: "sm", muted: true, max: 512 });
}

async function answer(parent, bp) {
  const { inner } = headed(parent, bp, { tone: "panel", name: "Answer", align: "center" });
  heading_(inner, bp, "answer", { align: "center", lead: tl(H, "answer.lead") });
  const params = messageParams();
  const cards = ["prompt", "rules", "stream", "check"].map((id, i) =>
    instance("StepCard", {
      background: "raised",
      Number: String(i + 1),
      Title: tl(H, `answer.steps.${id}.title`),
      Text: tl(H, `answer.steps.${id}.text`, params),
    }),
  );
  grid(inner, bp, cards, { cols: bp === "desktop" ? 2 : 1, gap: 20 });
}

/** Columns "narrow": a heading in the first, 4fr of 11 (393 of 1080 at 1440), the content in the second. */
function narrowColumns(parent, bp) {
  if (bp === "desktop") {
    const row = columns(parent, 120, { name: "Columns", align: "start" });
    const aside = frame("Aside", { dir: "col", w: 393 });
    const body = frame("Content", { dir: "col", w: "fill" });
    add(row, aside);
    add(row, body);
    size(body, "fill");
    return { aside, body };
  }
  const col = frame("Columns", { dir: "col", gap: 40, w: "fill" });
  add(parent, col);
  const aside = frame("Aside", { dir: "col", w: "fill" });
  const body = frame("Content", { dir: "col", w: "fill" });
  add(col, aside);
  add(col, body);
  return { aside, body };
}

async function record(parent, bp) {
  const { inner } = section(parent, bp, { name: "Record" });
  const { aside, body } = narrowColumns(inner, bp);
  addInstance(aside, "SectionHeading", { breakpoint: bp, align: "start", level: "2", Eyebrow: tl(H, "record.eyebrow"), Title: tl(H, "record.title"), "Show lead": true, Lead: tl(H, "record.lead") }, { fill: true });
  const c = card("Record", { pad: 24, w: "fill", bg: "surface" });
  add(body, c);
  add(c, await para(tl(H, "record.list"), bp, { style: "App/Heading SM" }));
  const list = block(c, bp, 16, { name: "Items", gap: 12 });
  for (const item of ["question", "chunks", "documents", "embedding", "llm", "prompt", "context"]) {
    const row = frame("Item", { dir: "row", gap: 12, w: "fill" });
    const wrap = frame("Icon", { dir: "col", pad: [2, 0, 0, 0] });
    add(wrap, icon("Check", 20, "accent", "Check"));
    add(row, wrap);
    add(row, await para(tl(H, `record.items.${item}`), bp));
    add(list, row);
  }
  const append = block(body, bp, 32, { name: "Append" });
  await addPara(append, tl(H, "record.append"), bp);
}

async function run(parent, bp) {
  const desktop = bp === "desktop";
  const params = messageParams();
  const { inner } = section(parent, bp, { tone: "panel", name: "Run", align: "center" });
  heading_(inner, bp, "run", { align: "center", lead: tl(H, "run.lead") });
  const cards = [
    ["local", "Computer"],
    ["api", "Cloud"],
  ].map(([where, ic]) =>
    instance("FeatureCard", {
      breakpoint: bp,
      background: "raised",
      Title: tl(H, `run.${where}.title`),
      Text: tl(H, `run.${where}.text`, params),
      "Show link": false,
      Icon: ic,
    }),
  );
  const cardsBlock = block(inner, bp, "heading", { name: "Where it runs" });
  grid(cardsBlock, bp, cards, { cols: desktop ? 2 : 1, gap: 20 });
  const wrap = block(inner, bp, "section", { name: "Hardware" });
  const hardware = frame("Hardware columns", { dir: desktop ? "row" : "col", gap: desktop ? 120 : 40, w: "fill", align: "start" });
  add(wrap, hardware);
  const left = frame("Hardware text", { dir: "col", w: "fill" });
  add(hardware, left);
  size(left, "fill");
  add(left, await heading(tl(H, "run.hardware.title"), bp, "h3"));
  const lead = block(left, bp, 16, { name: "Lead" });
  await addPara(lead, tl(H, "run.hardware.lead"), bp);
  const list = block(left, bp, 20, { name: "Items", gap: 8 });
  for (const item of ["index", "answer", "first", "shared"]) await bullet(list, tl(H, `run.hardware.items.${item}`, params), bp, { indent: 8 });
  const gpu = frame("GPU", { dir: "col", pad: [desktop ? 48 : 0, 0, 0, 0], w: "fill" }); // lg:pt-12
  add(hardware, gpu);
  size(gpu, "fill");
  await addPara(gpu, tl(H, "run.hardware.gpu"), bp);
}

async function start(parent, bp) {
  const desktop = bp === "desktop";
  const f = facts();
  const { inner } = headed(parent, bp, { name: "Start" });
  heading_(inner, bp, "start", { lead: tl(H, "start.lead", f) });
  const grid1 = frame("Commands", { dir: "col", gap: 40, w: "fill" });
  add(inner, grid1);
  const row = frame("Two commands", { dir: desktop ? "row" : "col", gap: desktop ? 120 : 40, w: "fill", align: "start" });
  add(grid1, row);
  for (const [key, command, vars] of [
    ["start", START_COMMAND, undefined],
    ["seed", SEED_COMMAND, f],
  ]) {
    const col = frame(key, { dir: "col", w: "fill" });
    add(row, col);
    size(col, "fill");
    add(col, await para(tl(H, `start.${key}.title`), bp, { style: "App/Title" }));
    const cb = block(col, bp, 12, { name: "Command" });
    addInstance(cb, "CodeBlock", { breakpoint: bp, Label: tl(H, `start.${key}.label`), Command: command }, { fill: true });
    const t = block(col, bp, 12, { name: "Text" });
    await addPara(t, tl(H, `start.${key}.text`, vars), bp);
  }
  await addPara(grid1, tl(H, "start.open"), bp);
}

async function limits(parent, bp) {
  const f = facts();
  const { inner } = section(parent, bp, { tone: "panel", name: "Limits" });
  const { aside, body } = narrowColumns(inner, bp);
  addInstance(aside, "SectionHeading", { breakpoint: bp, align: "start", level: "2", Eyebrow: tl(H, "limits.eyebrow"), Title: tl(H, "limits.title"), "Show lead": false }, { fill: true });
  const c = card("Limits", { pad: 24, w: "fill", bg: "raised", gap: 12 });
  add(body, c);
  for (const item of ["ocr", "size", "accounts", "wrong", "language"]) await bullet(c, tl(H, `limits.items.${item}`, f), bp, { indent: 4 });
}

async function more(parent, bp) {
  const { inner } = section(parent, bp, { name: "More" });
  const { aside, body } = narrowColumns(inner, bp);
  addInstance(aside, "SectionHeading", { breakpoint: bp, align: "start", level: "2", Eyebrow: tl(H, "more.eyebrow"), Title: tl(H, "more.title"), "Show lead": true, Lead: tl(H, "more.lead") }, { fill: true });
  const links = frame("Links", { dir: "col", gap: 8, w: "fill", align: "start" });
  add(body, links);
  for (const doc of ["readme", "howItWorks", "evaluation"]) addInstance(links, "ArrowLink", { tone: "default", state: "default", Label: tl(H, `more.${doc}`) });
  const cta = block(body, bp, 32, { name: "GitHub", align: "start" });
  addInstance(cta, "LinkButton", { variant: "primary", icon: "left", Label: tl(H, "more.github") });
}

export async function howPage(bp) {
  const pg = pageFrame(bp);
  addInstance(pg, "SiteHeader", { breakpoint: bp, menu: "closed", current: "how-it-works" }, { fill: true });
  const main = frame("Main", { dir: "col", w: "fill" });
  add(pg, main);
  addInstance(main, "PageHeader", {
    breakpoint: bp,
    media: "how-flow",
    Eyebrow: tl(H, "hero.eyebrow"),
    Title: tl(H, "hero.title"),
    Lead: tl(H, "hero.lead"),
  }, { fill: true });
  await flows(main, bp);
  await ingest(main, bp);
  await search(main, bp);
  await fusion(main, bp);
  await gate(main, bp);
  await answer(main, bp);
  await record(main, bp);
  await run(main, bp);
  await start(main, bp);
  await limits(main, bp);
  await more(main, bp);
  addInstance(pg, "SiteFooter", { breakpoint: bp }, { fill: true });
  return pg;
}
