/** Start screen, search lab, documents, groups and settings parts. */
import { component, textProp, setup, instance } from "../../lib/components.js";
import { add, frame, size, text } from "../../lib/layout.js";
import { icon } from "../../lib/icons.js";
import { tw } from "../../lib/text.js";
import { listOf, variantSet, inst, iconBtn, button, src } from "./shared.js";

// ---------------------------------------------------------------------------------------------
// Start

const START = {
  examples: { icon: "Chat", role: "accent", title: "start.examples", keys: ["start.example1", "start.example2", "start.example3"], arrow: true },
  capabilities: { icon: "Bolt", role: "accent", title: "start.capabilities", keys: ["start.capability1", "start.capability2", "start.capability3"] },
  limitations: { icon: "Alert", role: "danger", title: "start.limitations", keys: ["start.limitation1", "start.limitation2", "start.limitation3"] },
};

async function buildStartCard() {
  await variantSet(
    "StartCard",
    listOf(Object.keys(START).map((kind) => ({ kind })), async (c, { kind }) => {
      const s = START[kind];
      setup(c, { dir: "col", gap: 16, pad: 16, radius: "lg", fill: "bubble-user", w: 224 });
      const head = frame("Heading", { dir: "row", gap: 8, align: "center", justify: "center", w: "fill" });
      add(head, icon(s.icon, 18, s.role, "Icon"));
      add(head, await text(tw(s.title), "App/Caption Heading", "fg", { name: "Title" }));
      add(c, head);
      const tiles = frame("Tiles", { dir: "col", gap: 12, w: "fill" });
      for (const key of s.keys) {
        const tile = frame("Tile", { dir: "row", gap: 8, pad: [8, 12], align: "center", justify: s.arrow ? "between" : "center", radius: "lg", fill: "bubble-ai", minH: 48, w: "fill" });
        add(tile, await text(tw(key), "App/Caption", "fg", { name: "Text", w: "fill", align: s.arrow ? "LEFT" : "CENTER" }));
        if (s.arrow) add(tile, icon("ArrowRight", 14, "accent", "Arrow"));
        add(tiles, tile);
      }
      add(c, tiles);
    }),
    { columns: 3, path: src("start/start-card.tsx"), description: "One of the three columns of the start screen (examples, capabilities, limitations): an icon and a title over a stack of tiles. The card is bubble-user, the tiles bubble-ai, so each level differs from the one below. Example tiles have an arrow and put their text in the message box." },
  );
}

async function buildStartScreen() {
  await variantSet(
    "StartScreen",
    listOf(["wide", "narrow"].map((layout) => ({ layout })), async (c, { layout }) => {
      const wide = layout === "wide";
      setup(c, { dir: "col", gap: 8, pad: [32, 16], align: "center", w: wide ? 736 : 375 });
      add(c, await text(tw("start.title"), "App/Title", "fg", { name: "Title", align: "CENTER" }));
      add(c, await text(tw("start.intro"), "App/Caption", "muted", { name: "Intro", w: wide ? 448 : "fill", align: "CENTER" }));
      const grid = frame("Cards", { dir: wide ? "row" : "col", gap: 16, pad: [24, 0, 0, 0], w: "fill" });
      for (const kind of Object.keys(START)) {
        const card = inst("StartCard", { kind }, `${tw(START[kind].title)} card`);
        add(grid, card);
        size(card, "fill");
      }
      add(c, grid);
    }),
    { columns: 2, path: src("start/start-screen.tsx"), description: "What the empty chat shows: a title, a short intro and three cards: what to ask, what the assistant does and where it stops. wide is the three columns (from a 672px container); narrow stacks them on a phone." },
  );
}

// ---------------------------------------------------------------------------------------------
// Search lab

const HIT_TEXT = "When a computerised system is used for recording certification and batch release, the system should allow only Qualified Persons to certify the release of the batches and it should clearly identify and record the person releasing or certifying the batches.";

async function buildSearchHitCard() {
  const set = await variantSet(
    "SearchHitCard",
    listOf(["both", "vector", "fulltext"].map((ranks) => ({ ranks })), async (c, { ranks }) => {
      setup(c, { dir: "col", gap: 8, pad: 12, radius: "lg", fill: "bubble-user", w: 704 });
      const head = frame("Header", { dir: "row", gap: 12, rowGap: 4, wrap: true, align: "center", w: "fill" });
      add(head, await text("1", "App/Heading SM", "fg", { name: "Position" }));
      add(head, await text(`eu-gmp-annex11.pdf, ${tw("documentView.page", { page: 5 })}`, "App/Caption Semibold", "accent", { name: "Link" }));
      const badge = (tone, label, name) => {
        const b = instance("Badge", { tone, Label: label, Icon: false });
        b.name = name;
        return b;
      };
      add(head, badge("neutral", tw("searchLab.score", { score: "0.0328" }), "Score badge"));
      add(head, ranks === "fulltext" ? badge("warn", tw("searchLab.notInVector"), "Vector badge") : badge("neutral", tw("searchLab.vectorRank", { rank: 1, distance: "0.284" }), "Vector badge"));
      add(head, ranks === "vector" ? badge("warn", tw("searchLab.notInFulltext"), "Full-text badge") : badge("neutral", tw("searchLab.fulltextRank", { rank: 1 }), "Full-text badge"));
      add(c, head);
      add(c, await text(HIT_TEXT, "App/Body", "fg", { name: "Passage", w: "fill" }));
    }),
    { columns: 3, path: src("search/search-hit-card.tsx"), description: "One ranked chunk of the search lab with the evidence behind its place: position, file and page (a link to the chunk), the score and where the vector and the full-text search ranked it. ranks=vector or fulltext is a chunk found by one method only (that badge turns warn). Override the badge labels for the real numbers." },
  );
  textProp(set, "Position", "1");
  textProp(set, "Link", `eu-gmp-annex11.pdf, ${tw("documentView.page", { page: 5 })}`);
  textProp(set, "Passage", HIT_TEXT);
}

async function buildSearchModeSelect() {
  const modes = [["hybrid", "searchLab.modeHybrid"], ["vector", "searchLab.modeVector"], ["fulltext", "searchLab.modeFulltext"]];
  const set = await variantSet(
    "SearchModeSelect",
    listOf(modes.map(([value]) => ({ value })), async (c, { value }) => {
      setup(c, { dir: "col", gap: 6, w: 704 });
      add(c, await text(tw("searchLab.mode"), "App/Body Medium", "fg", { name: "Legend" }));
      for (const [v, key] of modes) {
        const r = instance("Radio", { checked: String(v === value), state: "default", Label: tw(key) });
        r.name = `${v} option`;
        add(c, r);
        size(r, "fill");
      }
    }),
    { columns: 3, path: src("search/search-mode-select.tsx"), description: "The method of a search: hybrid (as used for answers), vector only, full-text only. A radio group with a legend; value is the checked option." },
  );
  textProp(set, "Legend", tw("searchLab.mode"));
}

// ---------------------------------------------------------------------------------------------
// Documents

const CHUNK_TEXT = "6. Accuracy Checks For critical data entered manually, there should be an additional check on the accuracy of the data. This check may be done by a second operator or by validated electronic means.";

async function buildChunkCard() {
  const set = await variantSet(
    "ChunkCard",
    listOf(["false", "true"].map((short) => ({ short })), async (c, { short }) => {
      setup(c, { dir: "col", gap: 8, pad: 12, radius: "lg", fill: "bubble-user", w: 704 });
      const meta = frame("Meta", { dir: "row", gap: 12, rowGap: 4, wrap: true, align: "center", w: "fill" });
      add(meta, await text(tw("documentView.page", { page: 3 }), "App/Caption Semibold", "fg", { name: "Page" }));
      add(meta, await text(tw("documentView.position", { position: 1 }), "App/Caption", "muted", { name: "Position" }));
      add(meta, await text(tw("counts.characters", { count: 330 }), "App/Caption", "muted", { name: "Characters" }));
      if (short === "true") {
        const b = instance("Badge", { tone: "warn", Label: tw("documentView.short"), Icon: false });
        b.name = "Short badge";
        add(meta, b);
      }
      add(c, meta);
      add(c, await text(CHUNK_TEXT, "App/Body", "fg", { name: "Text", w: "fill" }));
    }),
    { columns: 2, path: src("documents/chunk-card.tsx"), description: "One chunk exactly as it is stored and searched: page, position on the page, number of characters (and a warn Short badge under 200), then its text. In the code the filter's matches are marked with Highlighted." },
  );
  textProp(set, "Page", tw("documentView.page", { page: 3 }));
  textProp(set, "Position", tw("documentView.position", { position: 1 }));
  textProp(set, "Characters", tw("counts.characters", { count: 330 }));
  textProp(set, "Text", CHUNK_TEXT);
}

async function buildChunkStats() {
  const items = [
    ["Chunks", tw("documentView.statChunks"), "7"],
    ["Average", tw("documentView.statAverage"), "215"],
    ["Shortest", tw("documentView.statShortest"), "17"],
    ["Longest", tw("documentView.statLongest"), "330"],
    ["Short", tw("documentView.statShort", { chars: 200 }), "2"],
  ];
  const set = await component(
    "ChunkStats",
    async (c) => {
      setup(c, { dir: "row", gap: 12, w: 704 });
      for (const [name, label, value] of items) {
        const card = frame(`${name} stat`, { dir: "col", pad: [8, 12], radius: "lg", fill: "bubble-user", w: "fill" });
        add(card, await text(label, "App/Caption", "muted", { name: `${name} label`, w: "fill" }));
        add(card, await text(value, "App/Heading MD", "fg", { name: `${name} value` }));
        add(c, card);
        size(card, "fill");
      }
    },
    { path: src("documents/chunk-stats.tsx"), description: "The size of a document's chunks at a glance: count, average, shortest, longest and how many are under 200 characters. Five cards in a row (two columns on a phone in the code)." },
  );
  for (const [name, , value] of items) textProp(set, `${name} value`, value);
}

// ---------------------------------------------------------------------------------------------
// Groups

async function buildGroupDocumentItem() {
  const set = await component(
    "GroupDocumentItem",
    async (c) => {
      setup(c, { dir: "row", gap: 8, pad: [8, 12], align: "center", radius: "lg", fill: "bubble-user", w: 488 });
      add(c, icon("File", 18, "muted", "Icon"));
      const body = frame("Text", { dir: "col", w: "fill" });
      add(body, await text("eu-gmp-annex11.pdf", "App/Body Semibold", "fg", { name: "Filename", w: "fill", maxLines: 1 }));
      add(body, inst("DocumentStatus", { status: "ready" }, "Status"));
      add(c, body);
      add(c, iconBtn("Close", { variant: "default", tone: "danger", name: "Remove button" }));
    },
    { path: src("groups/group-document-item.tsx"), description: "A document of a group: icon, filename, status and a button that removes it from the group (not from the library)." },
  );
  textProp(set, "Filename", "eu-gmp-annex11.pdf");
}

async function buildConversationRow() {
  const set = await variantSet(
    "ConversationRow",
    listOf(["false", "true"].map((favourite) => ({ favourite })), async (c, { favourite }) => {
      setup(c, { dir: "row", gap: 8, pad: [8, 12], align: "start", radius: "lg", fill: "bubble-user", w: 488 });
      const lead = frame("Lead", { dir: "col", pad: [8, 0, 0, 0] });
      add(lead, icon("Chat", 14, "muted", "Icon"));
      add(c, lead);
      const summary = frame("Summary", { dir: "col", gap: 4, pad: [4, 0], w: "fill" });
      const row = frame("Title row", { dir: "row", gap: 8, align: "center", w: "fill" });
      add(row, await text("Who may certify batch release?", "App/Body Semibold", "fg", { name: "Title", w: "fill", maxLines: 1 }));
      add(row, await text("07:34", "App/Caption", "muted", { name: "Time" }));
      add(summary, row);
      add(summary, await text("Before a batch is released, the system must make changes visible and keep the records safe:", "App/Preview", "muted", { name: "Preview", w: "fill", maxLines: 2 }));
      add(c, summary);
      add(c, iconBtn("Star", { variant: "default", state: favourite === "true" ? "pressed" : "default", name: "Favourite button" }));
      add(c, iconBtn("Trash", { variant: "default", tone: "danger", name: "Delete button" }));
    }),
    { columns: 2, path: src("groups/conversation-row.tsx"), description: "A conversation in a group page: chat icon, title, time and the start of the answer, with a favourite toggle (pressed = accent star) and a delete button." },
  );
  textProp(set, "Title", "Who may certify batch release?");
  textProp(set, "Time", "07:34");
  textProp(set, "Preview", "Before a batch is released, the system must make changes visible and keep the records safe:");
}

// ---------------------------------------------------------------------------------------------
// Settings

const CONTEXT = "Answer briefly, as bullet points where it helps. Quote the exact requirement when there is one.";

async function radioGroup(legend, items, checked) {
  const g = frame(`${legend} group`, { dir: "col", gap: 6, w: "fill" });
  add(g, await text(legend, "App/Body Medium", "fg", { name: "Legend" }));
  items.forEach((label, i) => {
    const r = instance("Radio", { checked: String(i === checked), state: "default", Label: label });
    r.name = `${label} option`;
    add(g, r);
    size(r, "fill");
  });
  return g;
}

async function buildSettingsDialogBody() {
  await component(
    "SettingsDialogBody",
    async (c) => {
      setup(c, { dir: "col", gap: 24, w: 528 });
      const grid = frame("Language and appearance", { dir: "row", gap: 24, w: "fill" });
      const lang = await radioGroup(tw("settings.language"), [tw("settings.languageAuto"), tw("languages.en"), tw("languages.pl")], 0);
      const theme = await radioGroup(tw("settings.appearance"), [tw("settings.appearanceLight"), tw("settings.appearanceDark"), tw("settings.appearanceSystem")], 2);
      add(grid, lang, theme);
      size(lang, "fill");
      size(theme, "fill");
      add(c, grid);
      const d = inst("Divider");
      add(c, d);
      size(d, "fill");
      const area = instance("TextArea", {
        state: "focus",
        Label: tw("settings.personalContext"),
        Hint: tw("settings.personalContextHint"),
        Value: CONTEXT,
        Footer: tw("settings.characters", { count: CONTEXT.length, max: 2000 }),
      });
      area.name = "Personal context";
      const block = frame("Personal context block", { dir: "col", w: "fill" });
      add(block, area);
      size(area, "fill");
      add(block, button("link", "text", tw("common.clear"), { name: "Clear button" }));
      add(c, block);
    },
    { path: src("settings/settings-form.tsx"), description: "The form of the settings dialog: language and appearance as radio groups side by side, a divider, then the personal context text area with its counter and a Clear link. The text area shows the typed text in the placeholder colour (the core TextArea has no filled variant)." },
  );
}

async function buildSettingsDialog() {
  await component(
    "SettingsDialog",
    async (c) => {
      setup(c, { dir: "col", fill: "bg", radius: "xl", stroke: "border", w: 576, clip: true });
      const head = frame("Header", { dir: "col", pad: [16, 24], w: "fill", stroke: { role: "border", sides: ["bottom"] } });
      add(head, await text(tw("settings.title"), "App/Heading MD", "fg", { name: "Title", w: "fill" }));
      add(c, head);
      const body = frame("Body", { dir: "col", pad: [16, 24], w: "fill" });
      const b = inst("SettingsDialogBody");
      add(body, b);
      size(b, "fill");
      add(c, body);
      const foot = frame("Footer", { dir: "row", gap: 12, wrap: true, justify: "end", align: "center", pad: [16, 24], w: "fill", stroke: { role: "border", sides: ["top"] } });
      add(foot, button("secondary", "md", tw("common.cancel")), button("primary", "md", tw("common.save")));
      add(c, foot);
    },
    { path: src("settings/settings-dialog.tsx"), description: "The settings dialog (size xl, 576px): the core Dialog layout (rounded-xl, bg, border, header, body, footer with Cancel and Save) holding the SettingsDialogBody. It is drawn here because a core Dialog instance cannot take other components as its content." },
  );
}

export async function buildContentParts() {
  await buildStartCard();
  await buildStartScreen();
  await buildSearchHitCard();
  await buildSearchModeSelect();
  await buildChunkCard();
  await buildChunkStats();
  await buildGroupDocumentItem();
  await buildConversationRow();
  await buildSettingsDialogBody();
  await buildSettingsDialog();
}
