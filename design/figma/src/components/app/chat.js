/** Chat parts: messages, bubbles, answer actions and flags, citations, sources. */
import { component, textProp, setup, instance } from "../../lib/components.js";
import { add, frame, size, text } from "../../lib/layout.js";
import { icon } from "../../lib/icons.js";
import { tw } from "../../lib/text.js";
import { listOf, variantSet, inst, iconBtn, button, absolute, src, STYLE } from "./shared.js";

const ANSWER_TEXT =
  "Before a batch is released, the system must make changes visible and keep the records safe:\n\n1. Records that support batch release can be printed in a way that shows whether any data changed since it was entered [2].\n2. A risk assessment decides whether the system keeps an audit trail of every GMP-relevant change and deletion, with the reason for it [3].\n3. Data is protected against damage and checked for accessibility, readability and accuracy throughout the retention period [4].\n\nBack-ups are taken regularly, and restoring them is checked during validation and monitored periodically [5].";
const QUESTION_TEXT = "Who may certify batch release in a computerised system?";

async function buildDaySeparator() {
  const set = await component(
    "DaySeparator",
    async (c) => {
      setup(c, { dir: "row", gap: 12, align: "center", w: 736 });
      for (const side of ["Line start", "Line end"]) {
        const line = frame(side, { dir: "row", h: 1, fill: "border", w: "fill" });
        if (side === "Line start") add(c, line);
        else {
          add(c, await text(tw("time.today"), "App/Caption", "muted", { name: "Label" }));
          add(c, line);
        }
      }
    },
    { path: src("chat/day-separator.tsx"), description: "A 1px line with the day (Today, Yesterday, a date) in the middle, before the first turn of a day." },
  );
  textProp(set, "Label", tw("time.today"));
}

async function buildQuestionBubble() {
  const set = await variantSet(
    "QuestionBubble",
    listOf([{ shape: "short" }, { shape: "multiline" }], async (c, { shape }) => {
      const short = shape === "short";
      setup(c, { dir: "col", pad: [0, 0, 0, 16], w: short ? undefined : 736 });
      const bubble = frame("Bubble", { dir: "row", pad: [12, 22], radius: short ? "2xl" : "lg", fill: "bubble-user", w: short ? "hug" : "fill" });
      add(bubble, await text(QUESTION_TEXT, "App/Message", "fg", { name: "Text", w: short ? "hug" : "fill" }));
      add(c, bubble);
      if (!short) size(bubble, "fill");
    }),
    {
      path: src("chat/question-bubble.tsx"),
      description: "The question: as wide as its text (bubble-user, padding 12 and 22). shape=short is round (radius 16); multiline, for a long or several-line question, is squarer (radius 8) and fills the width. The 16px inset on the left tucks it under the avatar.",
    },
  );
  textProp(set, "Text", QUESTION_TEXT);
}

async function buildRatingPill() {
  await variantSet(
    "RatingPill",
    listOf(["none", "up", "down"].map((rating) => ({ rating })), async (c, { rating }) => {
      setup(c, { dir: "row", pad: [0, 2], align: "center", h: 24, radius: "2xl", fill: "chip" });
      for (const [name, key, ic] of [["Good answer", "up", "Smile"], ["Bad answer", "down", "Frown"]]) {
        const on = rating === key;
        const cell = frame(name, { dir: "row", w: 24, h: 24, align: "center", justify: "center", radius: "full", fill: on ? "accent" : undefined });
        add(cell, icon(ic, 16, on ? "accent-fg" : "fg", "Icon"));
        add(c, cell);
      }
    }),
    { columns: 3, path: src("chat/rating-pill.tsx"), description: "Rates a stored answer: two round toggle buttons in a chip pill (24px high). rating=up or down is the pressed one (accent); pressing it again withdraws the rating." },
  );
}

async function buildAnswerFlags() {
  const flags = ["none", "notFound", "noCitations", "stopped"];
  await variantSet(
    "AnswerFlags",
    listOf(flags.map((flag) => ({ flag })), async (c, { flag }) => {
      setup(c, { dir: "row", gap: 8, align: "center", w: 672 });
      if (flag === "notFound" || flag === "noCitations") {
        const b = instance("Badge", { tone: "warn", Label: tw(flag === "notFound" ? "answer.notFound" : "answer.noCitations") });
        b.name = "Flag";
        add(c, b);
      }
      if (flag === "stopped") {
        const b = instance("Badge", { tone: "neutral", Label: tw("answer.stopped"), Icon: false });
        b.name = "Flag";
        add(c, b);
      }
      add(c, await text(tw("answer.aiGenerated"), "App/Caption", "muted", { name: "Notice", w: "fill" }));
    }),
    {
      columns: 4,
      path: src("chat/answer-flags.tsx"),
      description: "The line under an answer's text: warn Badges for not found or no citations, a neutral Badge for a stopped answer, and always the muted AI-generated notice. flag=none is only the notice.",
    },
  );
}

async function buildAnswerActions() {
  const list = [];
  for (const layout of ["wide", "narrow"]) for (const rating of ["none", "up", "down"]) list.push({ rating, layout });
  await variantSet(
    "AnswerActions",
    listOf(list, async (c, { rating, layout }) => {
      const narrow = layout === "narrow";
      setup(c, { dir: narrow ? "col" : "row", gap: 8, align: narrow ? "start" : "center", w: narrow ? 263 : 672 });
      const pill = inst("RatingPill", { rating }, "Rating");
      const sources = button("chip", "xs", tw("counts.citedSources", { count: 4 }), { name: "Sources button" });
      const regenerate = button("chip", "xs", tw("chat.regenerate"), { icon: "Refresh", name: "Regenerate button" });
      const copy = button("chip", "xs", tw("chat.copy"), { icon: "Copy", name: "Copy button" });
      if (narrow) {
        const first = frame("Rating and sources", { dir: "row", gap: 8, align: "center" });
        add(first, pill, sources);
        const second = frame("Regenerate and copy", { dir: "row", gap: 8, align: "center", justify: "end", w: "fill" });
        add(second, regenerate, copy);
        add(c, first, second);
      } else {
        add(c, pill, sources);
        const grow = frame("Spacer", { dir: "row", w: 1, h: 1 });
        add(c, grow);
        size(grow, "fill");
        const end = frame("Regenerate and copy", { dir: "row", gap: 8, align: "center" });
        add(end, regenerate, copy);
        add(c, end);
      }
    }),
    {
      columns: 3,
      path: src("chat/answer-actions.tsx"),
      description: "The row under a finished answer: rating pill and the sources button on the left, Regenerate and Copy chips pushed to the right. layout=narrow is the phone, where the row wraps and the chips go to a second line. Override the label of the sources button for the count (1 cited source, 4 cited sources, 6 excerpts searched).",
    },
  );
}

async function buildCitationButton() {
  const set = await variantSet(
    "CitationButton",
    listOf(["default", "hover"].map((state) => ({ state })), async (c, { state }) => {
      setup(c, { dir: "row", pad: [1, 2], align: "center", radius: "sm", fill: state === "hover" ? "surface-2" : undefined });
      add(c, await text("[1]", STYLE.xs.semi, "accent", { name: "Number" }));
    }),
    { columns: 2, path: src("chat/citation-button.tsx"), description: "A citation marker [n] in an answer: a small semibold link in the accent colour (it is a superscript in the code, which Figma text cannot be inside a sentence). Hover shows the file and page; click opens the source panel." },
  );
  textProp(set, "Number", "[1]");
}

// ---------------------------------------------------------------------------------------------
// Message

async function drawMessage(c, { role, shape, rating, layout }) {
  const answer = role === "answer";
  const narrow = layout === "narrow";
  setup(c, { dir: "col", w: 736, clip: false });
  const head = frame("Header", { dir: "row", gap: 8, pad: [0, 0, 0, 40], align: "center", h: 16, w: "fill" });
  add(head, await text(answer ? tw("chat.authorResponse") : tw("chat.authorYou"), "App/Caption Semibold", "fg", { name: "Author" }));
  add(head, await text("07:34", "App/Caption", "muted", { name: "Time" }));
  add(c, head);
  if (!answer) {
    const q = inst("QuestionBubble", { shape }, "Question");
    add(c, q);
    size(q, "fill");
  } else {
    const wrap = frame("Answer bubble", { dir: "col", pad: [0, 0, 0, 16], w: "fill" });
    const bubble = frame("Answer", { dir: "col", pad: narrow ? [16, 16] : [20, 24], radius: "lg", fill: "bubble-ai", w: "fill" });
    add(bubble, await text(ANSWER_TEXT, "App/Message", "fg", { name: "Body", w: "fill" }));
    const flags = frame("Flags", { dir: "col", pad: [8, 0, 0, 0], w: "fill" });
    const f = inst("AnswerFlags", { flag: "none" }, "Answer flags");
    add(flags, f);
    size(f, "fill");
    add(bubble, flags);
    const actions = frame("Actions", { dir: "col", pad: [16, 0, 0, 0], w: "fill" });
    const a = inst("AnswerActions", { rating, layout }, "Answer actions");
    add(actions, a);
    size(a, "fill");
    add(bubble, actions);
    add(wrap, bubble);
    add(c, wrap);
  }
  // The avatar sits on the corner and overlaps the bubble.
  const avatar = frame("Avatar", { dir: "row", w: 32, h: 32, align: "center", justify: "center", radius: "lg", fill: answer ? "accent" : "chip" });
  add(avatar, icon(answer ? "Sparkles" : "User", 18, answer ? "accent-fg" : "fg", "Icon"));
  add(c, avatar);
  absolute(avatar, 0, 0);
}

async function buildMessage() {
  const list = [
    { role: "question", shape: "short", rating: "none", layout: "wide" },
    { role: "question", shape: "multiline", rating: "none", layout: "wide" },
    { role: "answer", shape: "full", rating: "none", layout: "wide" },
    { role: "answer", shape: "full", rating: "up", layout: "wide" },
    { role: "answer", shape: "full", rating: "down", layout: "wide" },
    { role: "answer", shape: "full", rating: "none", layout: "narrow" },
  ];
  const set = await variantSet("Message", listOf(list, drawMessage), {
    columns: 2,
    path: src("chat/message.tsx"),
    description:
      "One side of a turn: a 32px avatar (person on chip, sparkles on accent) on the corner, the author and time on the line above, and the bubble 16px to the right, tucked under the avatar. role=question holds a QuestionBubble (shape short is round, multiline is squarer); role=answer holds the answer text, the AnswerFlags and the AnswerActions (rating none, up or down; layout narrow for phones). The answer text is plain here: citations and the list are typed as [n] and 1. 2. 3.",
  });
  textProp(set, "Time", "07:34");
  textProp(set, "Body", ANSWER_TEXT);
}

// ---------------------------------------------------------------------------------------------
// Sources

async function buildSourceCard() {
  const set = await variantSet(
    "SourceCard",
    listOf(["false", "true"].map((selected) => ({ selected })), async (c, { selected }) => {
      const on = selected === "true";
      setup(c, { dir: "col", gap: 8, pad: 12, radius: "lg", fill: "bubble-ai", w: 336, stroke: on ? { role: "accent", weight: 2 } : undefined });
      const head = frame("Header", { dir: "row", gap: 8, align: "start", justify: "between", w: "fill" });
      const title = frame("Title", { dir: "col", w: "fill" });
      const name = frame("Number and file", { dir: "row", gap: 4, w: "fill" });
      add(name, await text("[2]", "App/Caption Heading", "accent", { name: "Number" }));
      add(name, await text("eu-gmp-annex11.pdf", "App/Caption Heading", "fg", { name: "Filename", w: "fill" }));
      add(title, name);
      add(title, await text(tw("sources.page", { page: 4, version: 1 }), "App/Caption", "muted", { name: "Meta", w: "fill" }));
      add(head, title);
      const link = frame("Open PDF", { dir: "row", gap: 4, pad: [4, 8], align: "center", radius: "md", minH: 24 });
      add(link, await text(tw("sources.openPdf"), "App/Caption Medium", "accent", { name: "Open PDF label" }));
      add(link, icon("External", 14, "accent", "Icon"));
      add(head, link);
      add(c, head);
      const quote = frame("Passage", { dir: "col", pad: [0, 0, 0, 12], w: "fill", maxH: 192, clip: true, stroke: { role: "border", sides: ["left"], weight: 2 } });
      add(quote, await text("For records supporting batch release it should be possible to generate printouts indicating if any of the data has been changed since the original entry.", "App/Body", "muted", { name: "Passage text", w: "fill" }));
      add(c, quote);
    }),
    {
      columns: 2,
      path: src("chat/source-card.tsx"),
      description: "One excerpt an answer was based on: [n], filename and page on the left, an Open PDF link on the right, the passage as a quote (a 2px border on the left, at most 192px high). selected=true is the one the reader opened (accent border).",
    },
  );
  textProp(set, "Number", "[2]");
  textProp(set, "Filename", "eu-gmp-annex11.pdf");
  textProp(set, "Meta", tw("sources.page", { page: 4, version: 1 }));
  textProp(set, "Passage text", "For records supporting batch release it should be possible to generate printouts indicating if any of the data has been changed since the original entry.");
}

const PASSAGES = [
  [2, "eu-gmp-annex11.pdf", 4, "For records supporting batch release it should be possible to generate printouts indicating if any of the data has been changed since the original entry."],
  [3, "eu-gmp-annex11.pdf", 4, "Consideration should be given, based on a risk assessment, to building into the system the creation of a record of all GMP-relevant changes and deletions (a system generated \"audit trail\"). For change or deletion of GMP-relevant data the reason should be documented."],
  [4, "eu-gmp-annex11.pdf", 3, "Data should be secured by both physical and electronic means against damage. Stored data should be checked for accessibility, readability and accuracy. Access to data should be ensured throughout the retention period."],
  [5, "eu-gmp-annex11.pdf", 3, "Regular back-ups of all relevant data should be done. Integrity and accuracy of backup data and the ability to restore the data should be checked during validation and monitored periodically."],
  [1, "eu-gmp-annex11.pdf", 5, "When a computerised system is used for recording certification and batch release, the system should allow only Qualified Persons to certify the release of the batches and it should clearly identify and record the person releasing or certifying the batches."],
  [6, "fda-data-integrity-qa.pdf", 12, "Personnel responsible for record review under CGMP should review the audit trails that capture changes to data associated with the record as they review the rest of the record."],
];

function card([n, file, page, passage], selected) {
  return inst("SourceCard", { selected: String(selected), Number: `[${n}]`, Filename: file, Meta: tw("sources.page", { page, version: 1 }), "Passage text": passage }, `Source ${n}`);
}

async function buildSourcesPanel() {
  const set = await component(
    "SourcesPanel",
    async (c) => {
      setup(c, { dir: "col", pad: [0, 16, 16, 0], w: 384, h: 900, clip: true });
      const bar = frame("Bar", { dir: "row", gap: 8, pad: [0, 16], align: "center", h: 64, w: "fill" });
      const left = frame("Heading", { dir: "col", w: "fill" });
      add(left, await text(tw("sources.title"), "App/Bar", "fg", { name: "Title", w: "fill", maxLines: 1 }));
      add(left, await text(tw("counts.citedSources", { count: 4 }), "App/Caption", "muted", { name: "Subtitle", w: "fill", maxLines: 1 }));
      add(bar, left);
      add(bar, iconBtn("Close", { name: "Close button" }));
      add(c, bar);
      const body = frame("Panel", { dir: "col", gap: 20, pad: 16, radius: "lg", fill: "panel", clip: true, w: "fill", h: "fill" });
      const groups = [
        [tw("sources.cited"), PASSAGES.slice(0, 4)],
        [tw("sources.notCited"), PASSAGES.slice(4)],
      ];
      for (const [title, items] of groups) {
        const section = frame(title, { dir: "col", gap: 8, w: "fill" });
        add(section, await text(title, "App/Overline", "muted", { name: "Group title" }));
        const list = frame("Sources", { dir: "col", gap: 12, w: "fill" });
        for (const p of items) {
          const k = card(p, p[0] === 2);
          add(list, k);
          size(k, "fill");
        }
        add(section, list);
        add(body, section);
      }
      add(c, body);
    },
    {
      path: src("chat/sources-panel.tsx"),
      description: "The side panel of an answer's sources, as tall as the window: a bar with the title, the count and a close button, then a rounded panel with the cited excerpts first and the searched-but-not-cited ones after, each a SourceCard. From xl it stands next to the page; below it covers the page from the right.",
    },
  );
  textProp(set, "Title", tw("sources.title"));
  textProp(set, "Subtitle", tw("counts.citedSources", { count: 4 }));
}

async function buildAnsweringIndicator() {
  await component(
    "AnsweringIndicator",
    (c) => {
      setup(c, { dir: "row", align: "center" });
      add(c, icon("Sparkles", 18, "ai", "Icon"));
    },
    { path: src("chat/answering-indicator.tsx"), description: "Replaces the chat icon in a list while the assistant answers in that conversation (it pulses in the code; the label is read aloud only)." },
  );
}

export async function buildChatParts() {
  await buildDaySeparator();
  await buildQuestionBubble();
  await buildRatingPill();
  await buildAnswerFlags();
  await buildAnswerActions();
  await buildCitationButton();
  await buildMessage();
  await buildSourceCard();
  await buildSourcesPanel();
  await buildAnsweringIndicator();
}
