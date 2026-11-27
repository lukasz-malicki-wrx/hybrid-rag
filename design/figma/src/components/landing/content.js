/**
 * Landing components, part 4: the parts of the sections (apps/landing/src/sections).
 * AnswerExample, BuiltWithItem, GalleryTabs, FlowStepCard, StepListItem, StepCard, CodeBlock,
 * FusionTable, FaqItem.
 */
import { instance, setup, swapProp, textProp } from "../../lib/components.js";
import { add, frame, shadow, size, text } from "../../lib/layout.js";
import { icon } from "../../lib/icons.js";
import { tl, tlRaw } from "../../lib/text.js";
import { listOf, variantSet } from "../core/shared.js";
import { BP, facts, sideStroke, START_COMMAND, tile } from "./shared.js";

const PATH = "apps/landing/src/sections";

// ---------------------------------------------------------------------------------------------

async function buildAnswerExample() {
  const k = "examples.cited";
  const label = tl("home", "examples.questionLabel");
  const question = tl("home", `${k}.question`);
  const answer = tl("home", `${k}.answer`);
  const source = tl("home", `${k}.source`);
  const set = await variantSet(
    "AnswerExample",
    listOf(BP.map((breakpoint) => ({ breakpoint })), async (c, { breakpoint: bp }) => {
      const desktop = bp === "desktop";
      setup(c, { dir: "col", gap: 24, pad: 24, radius: "lg", stroke: "border", fill: "surface", w: desktop ? 588 : 327 });
      const top = frame("Question", { dir: desktop ? "row" : "col", gap: 16, w: "fill" });
      add(c, top);
      const t = tile("lg", "Sparkles", "Tile icon");
      add(top, t);
      const bar = frame("Question bar", { dir: "col", gap: 4, pad: [12, 16], justify: "center", radius: "lg", fill: "surface-2", minH: 80 });
      add(top, bar);
      size(bar, "fill");
      add(bar, await text(label, "App/Caption", "muted", { name: "Question label", w: "fill" }));
      add(bar, await text(question, "App/Title", "fg", { name: "Question", w: "fill" }));
      add(c, await text(answer, "App/Text Base", "fg", { name: "Answer", w: "fill" }));
      const foot = frame("Source and badge", { dir: "row", gap: 16, pad: [16, 0, 0, 0], align: "center", justify: "between", w: "fill", wrap: true, rowGap: 12 });
      sideStroke(foot, "border", ["top"]);
      add(c, foot);
      const src = frame("Source", { dir: "row", gap: 8, align: "center" });
      add(src, icon("File", 16, "muted", "Source icon"));
      add(src, await text(source, "App/Body", "muted", { name: "Source" }));
      add(foot, src);
      add(foot, instance("Badge", { tone: "neutral", Icon: false, Label: tl("home", "examples.badge") }));
    }),
    {
      path: `${PATH}/home/answer-example.tsx`,
      description:
        "One example answer, in the layout of a testimonial: the question in a bar beside an 80px icon tile, the answer, and under a rule its source and a badge. Wide: the tile and the bar side by side; phone: one over the other.",
    },
  );
  textProp(set, "Question label", label);
  textProp(set, "Question", question);
  textProp(set, "Answer", answer);
  textProp(set, "Source", source);
  swapProp(set, "Tile icon", "Sparkles");
  swapProp(set, "Source icon", "File");
}

async function buildBuiltWithItem() {
  const label = tl("home", "builtWith.items.postgres");
  const set = await variantSet(
    "BuiltWithItem",
    listOf(BP.map((breakpoint) => ({ breakpoint })), async (c, { breakpoint: bp }) => {
      const desktop = bp === "desktop";
      if (desktop) setup(c, { dir: "col", gap: 8, align: "center" });
      else setup(c, { dir: "col", gap: 8, pad: [16, 8], align: "center", justify: "center", radius: "lg", stroke: "border", fill: "card-raised", minH: 68, w: 159 });
      add(c, icon("Postgres", 28, "muted", "Icon"));
      add(c, await text(label, desktop ? "App/Heading MD" : "App/Heading SM", "muted", { name: "Label" }));
    }),
    {
      path: `${PATH}/home/built-with.tsx`,
      description: "One of the parts it is made of: its logo (28px, muted) over its name. Wide screens: no box, in a row; a phone: a bordered tile in a 2-column grid (min height 68).",
    },
  );
  textProp(set, "Label", label);
  swapProp(set, "Icon", "Postgres");
}

async function buildGalleryTabs() {
  const areas = ["all", "chat", "sources", "documents", "quality"];
  await variantSet(
    "GalleryTabs",
    listOf(areas.map((value) => ({ value })), async (c, { value }) => {
      setup(c, { dir: "row", gap: 4, pad: 4, align: "center", radius: "lg", fill: "surface-2", stroke: "border", w: 860, h: 48 });
      for (const area of areas) {
        const selected = area === value;
        const tab = frame(`Tab ${area}`, { dir: "row", pad: [0, 8], align: "center", justify: "center", radius: "md", fill: selected ? "bg" : undefined, h: 40 });
        const label = await text(tl("home", `gallery.areas.${area}`), "App/Caption Semibold", selected ? "accent" : "muted", { name: `Label ${area}` });
        label.textCase = "UPPER";
        add(tab, label);
        add(c, tab);
        size(tab, "fill");
        if (selected) await shadow(tab, "Shadow/SM");
      }
    }),
    {
      columns: 3,
      path: "apps/landing/src/sections/home/gallery-filter.tsx",
      description:
        "The tabs that filter the gallery: the shared Tabs (surface-2 track, the selected tab is bg with an accent label) with the five areas, at most 860 wide (max-w-215). On a phone the same filter is a Select.",
    },
  );
}

// ---------------------------------------------------------------------------------------------
// How it works

async function buildFlowStepCard() {
  const k = "flows.ingest.steps.upload";
  const f = facts();
  const title = tl("howItWorks", `${k}.title`);
  const body = tl("howItWorks", `${k}.text`, f);
  const set = await variantSet(
    "FlowStepCard",
    listOf([{ background: "surface" }, { background: "raised" }], async (c, { background }) => {
      setup(c, { dir: "col", gap: 8, pad: 16, radius: "lg", stroke: "border", fill: background === "raised" ? "card-raised" : "surface", w: 285 });
      const row = frame("Icon and number", { dir: "row", align: "center", justify: "between", w: "fill" });
      add(row, icon("File", 22, "muted", "Icon"));
      add(row, await text("1", "App/Caption Semibold", "muted", { name: "Number" }));
      add(c, row);
      add(c, await text(title, "App/Heading SM", "fg", { name: "Title", w: "fill" }));
      add(c, await text(body, "App/Body", "muted", { name: "Text", w: "fill" }));
    }),
    {
      path: `${PATH}/how-it-works/flow-diagram.tsx`,
      description: "One box of a flow diagram: an icon (22px) and the step number, the step's name and a sentence, in a Card with p-4. The arrows between boxes are drawn by the page.",
    },
  );
  textProp(set, "Number", "1");
  textProp(set, "Title", title);
  textProp(set, "Text", body);
  swapProp(set, "Icon", "File");
}

function numberCircle(px, label) {
  const c = frame(`Number ${px}`, { dir: "row", align: "center", justify: "center", w: px, h: px, radius: "full", stroke: "border", fill: "surface-2" });
  return c;
}

async function buildStepListItem() {
  const k = "ingest.steps.save";
  const f = facts();
  const title = tl("howItWorks", `${k}.title`);
  const body = tl("howItWorks", `${k}.text`, f);
  const set = await variantSet(
    "StepListItem",
    listOf([{ connector: "true" }, { connector: "false" }], async (c, { connector }) => {
      setup(c, { dir: "row", gap: 16, pad: connector === "true" ? [0, 0, 32, 0] : 0, w: 540 });
      const n = numberCircle(40);
      add(n, await text("1", "App/Body Semibold", "fg", { name: "Number" }));
      add(c, n);
      const col = frame("Step", { dir: "col", pad: [6, 0, 0, 0] });
      add(c, col);
      size(col, "fill");
      add(col, await text(title, "App/Heading MD", "fg", { name: "Title", w: "fill" }));
      const t = frame("Text block", { dir: "col", pad: [8, 0, 0, 0], w: "fill" });
      add(t, await text(body, "App/Text Base", "fg", { name: "Text", w: "fill" }));
      add(col, t);
      if (connector === "true") {
        // The line to the next step: from under the circle to the bottom of the item.
        const line = frame("Connector", { dir: "col", fill: "border", w: 1, h: 1 });
        add(c, line);
        line.layoutPositioning = "ABSOLUTE";
        line.x = 19;
        line.y = 40;
        line.resize(1, Math.max(1, c.height - 40));
        line.constraints = { horizontal: "MIN", vertical: "STRETCH" };
      }
    }),
    {
      path: `${PATH}/how-it-works/step-list.tsx`,
      description: "A numbered step of a process told in order: a 40px circle with the number, a title and a paragraph. connector=true draws the 1px line down to the next step (every step but the last).",
    },
  );
  textProp(set, "Number", "1");
  textProp(set, "Title", title);
  textProp(set, "Text", body);
}

async function buildStepCard() {
  const k = "answer.steps.prompt";
  const title = tl("howItWorks", `${k}.title`);
  const body = tl("howItWorks", `${k}.text`, facts());
  const set = await variantSet(
    "StepCard",
    listOf([{ background: "raised" }, { background: "surface" }], async (c, { background }) => {
      setup(c, { dir: "col", pad: 24, radius: "lg", stroke: "border", fill: background === "raised" ? "card-raised" : "surface", w: 590 });
      const n = numberCircle(36);
      add(n, await text("1", "App/Body Semibold", "fg", { name: "Number" }));
      add(c, n);
      const t = frame("Title block", { dir: "col", pad: [16, 0, 0, 0], w: "fill" });
      add(t, await text(title, "App/Heading MD", "fg", { name: "Title", w: "fill" }));
      add(c, t);
      const b = frame("Text block", { dir: "col", pad: [8, 0, 0, 0], w: "fill" });
      add(b, await text(body, "App/Text Base", "fg", { name: "Text", w: "fill" }));
      add(c, b);
    }),
    {
      path: `${PATH}/how-it-works/step-grid.tsx`,
      description: "A step as a card, for a short sequence in two columns: a 36px numbered circle, a title (md) and a paragraph, in a Card with p-6. background=raised is the card on a panel section.",
    },
  );
  textProp(set, "Number", "1");
  textProp(set, "Title", title);
  textProp(set, "Text", body);
}

async function buildCodeBlock() {
  const label = tl("howItWorks", "start.start.label");
  const command = START_COMMAND;
  const set = await variantSet(
    "CodeBlock",
    listOf(BP.map((breakpoint) => ({ breakpoint })), async (c, { breakpoint: bp }) => {
      setup(c, { dir: "col", gap: 8, pad: [14, 16], radius: "lg", stroke: "border", fill: "surface-2", w: bp === "desktop" ? 540 : 327 });
      add(c, await text(label, "App/Body Medium", "muted", { name: "Label", w: "fill" }));
      add(c, await text(command, "App/Body", "fg", { name: "Command", w: "fill" }));
    }),
    {
      path: `${PATH}/how-it-works/code-block.tsx`,
      description: "A command to copy, in a figure named by its caption: a bordered surface-2 box with the caption (medium, muted) over the command. The code sets the command at 15px; the nearest style is 14.",
    },
  );
  textProp(set, "Label", label);
  textProp(set, "Command", command);
}

// The worked example of rank fusion (fusion.ts): invented positions, k = 60.
const CHUNKS = [
  { name: "A", meaning: 1, words: 3 },
  { name: "B", meaning: 2, words: null },
  { name: "C", meaning: 4, words: 2 },
  { name: "D", meaning: 7, words: 1 },
];
const points = (p) => (p === null ? 0 : 1 / (60 + p));

async function buildFusionTable() {
  const rows = CHUNKS.map((c) => ({ ...c, points: points(c.meaning) + points(c.words) }));
  const order = [...rows].sort((a, b) => b.points - a.points);
  for (const r of rows) r.place = order.indexOf(r) + 1;
  const best = Math.max(...rows.map((r) => r.points));
  const T = (key) => tl("howItWorks", `search.fusion.table.${key}`);
  await variantSet(
    "FusionTable",
    listOf(BP.map((breakpoint) => ({ breakpoint })), async (c, { breakpoint: bp }) => {
      const desktop = bp === "desktop";
      const w = desktop ? 540 : 327;
      const cols = desktop ? [80, 100, 100, 198, 60] : [40, 78, 64, 89, 54];
      const padX = desktop ? 16 : 8;
      const body = desktop ? "App/Text Base" : "App/Body";
      const strong = desktop ? "App/Heading SM" : "App/Body Semibold";
      setup(c, { dir: "col", radius: "lg", stroke: "border", fill: "card-raised", w, clip: true });
      const cap = frame("Caption", { dir: "col", pad: [16, padX, 4, padX], w: "fill" });
      add(cap, await text(T("caption"), "App/Body", "muted", { name: "Caption", w: "fill" }));
      add(c, cap);
      const row = async (cells, o = {}) => {
        const r = frame(o.name, { dir: "row", w: "fill" });
        if (!o.last) sideStroke(r, "border", ["bottom"]);
        add(c, r);
        for (let i = 0; i < cells.length; i++) {
          const cell = frame(`Cell ${i + 1}`, { dir: "col", gap: 4, pad: [10, padX], justify: "center", w: cols[i] });
          add(r, cell);
          const spec = cells[i];
          if (spec.text) add(cell, await text(spec.text, spec.style, spec.role || "fg", { name: spec.name, w: "fill" }));
          if (spec.bar) add(cell, frame("Bar", { dir: "row", w: Math.max(1, Math.round(spec.bar * (cols[i] - 2 * padX))), h: 4, radius: "full", fill: "accent" }));
        }
      };
      const head = (t) => ({ text: t, style: desktop ? "App/Body Medium" : "App/Body Medium", role: "muted", name: "Heading" });
      await row([{ text: " ", style: "App/Body Medium", role: "muted", name: "Heading" }, head(T("meaning")), head(T("words")), head(T("points")), head(T("place"))], { name: "Header" });
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const dash = "–";
        await row(
          [
            { text: r.name, style: strong, name: "Chunk" },
            { text: r.meaning === null ? dash : String(r.meaning), style: body, name: "Meaning" },
            { text: r.words === null ? dash : String(r.words), style: body, name: "Words" },
            { text: r.points.toFixed(4), style: body, name: "Points", bar: r.points / best },
            { text: String(r.place), style: r.place === 1 ? strong : body, name: "Place" },
          ],
          { name: `Row ${r.name}`, last: i === rows.length - 1 },
        );
      }
    }),
    {
      path: `${PATH}/how-it-works/fusion-table.tsx`,
      description:
        "The worked example of rank fusion as a table: each chunk's position in the two lists, its points (1 / (60 + position), summed) and its place; the bar under the points is decoration, the numbers carry the information. A dash means the chunk is not in that list. The numbers are the example of fusion.ts, computed here with the same formula.",
    },
  );
}

// ---------------------------------------------------------------------------------------------
// FAQ

async function buildFaqItem() {
  const q = tl("faq", "items.whatIs.q");
  const a = tl("faq", "items.whatIs.a");
  const set = await variantSet(
    "FaqItem",
    listOf([{ state: "closed" }, { state: "open" }], async (c, { state }) => {
      setup(c, { dir: "col", w: 687 });
      sideStroke(c, "border", ["bottom"]);
      const summary = frame("Question row", { dir: "row", gap: 16, pad: [16, 0], minH: 48, align: "center", justify: "between", w: "fill" });
      add(summary, await text(q, "App/Heading SM", "fg", { name: "Question", w: "fill" }));
      add(summary, icon(state === "open" ? "Close" : "Plus", 18, "muted", "Icon"));
      add(c, summary);
      if (state === "open") {
        const body = frame("Answer block", { dir: "col", pad: [0, 0, 24, 0], w: "fill" });
        const t = await text(a, "App/Text Base", "fg", { name: "Answer", w: "fill" });
        add(body, t);
        t.maxWidth = 512; // max-w-copy
        add(c, body);
      }
    }),
    {
      path: `${PATH}/faq/faq-list.tsx`,
      description:
        "One question of the FAQ, a native <details>: the question (medium; the nearest style is semibold) and a plus that turns into a cross when open, a rule under it; open shows the answer (max 32em). The list around the items has a rule on top.",
    },
  );
  textProp(set, "Question", q);
  textProp(set, "Answer", a);
}

export async function buildContent() {
  await buildAnswerExample();
  await buildBuiltWithItem();
  await buildGalleryTabs();
  await buildFlowStepCard();
  await buildStepListItem();
  await buildStepCard();
  await buildCodeBlock();
  await buildFusionTable();
  await buildFaqItem();
}
