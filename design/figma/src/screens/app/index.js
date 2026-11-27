/**
 * App screens: the chat application as in apps/web, built only from instances of the components
 * plus layout frames and texts. Desktop frames are 1440x900, phone frames 375x812, both clipped.
 * Every screen is drawn light; screenRow() adds the dark copy beside it.
 */
import { instance, setProps } from "../../lib/components.js";
import { add, frame, size, text } from "../../lib/layout.js";
import { screenRow } from "../../lib/pages.js";
import { tw } from "../../lib/text.js";
import { nestedText } from "../../components/app/shared.js";
import * as D from "./data.js";

const inst = (name, props = {}, layerName) => {
  const i = instance(name, props);
  if (layerName) i.name = layerName;
  return i;
};

/** An instance that fills its auto layout parent's width. */
function fillW(parent, node) {
  add(parent, node);
  size(node, "fill");
  return node;
}

// ---------------------------------------------------------------------------------------------
// The sidebar column (320px): header, then what the section needs

function columnFrame() {
  return frame("Sidebar column", { dir: "col", gap: 16, pad: [16, 16, 0, 16], w: 320, h: "fill", clip: true });
}

function chatCard(chat, active) {
  const card = inst("ConversationCard", { state: active ? "active" : "default", favourite: String(!!chat.favourite), Title: chat.title, Time: chat.time, Preview: chat.preview }, chat.title);
  return card;
}

function chatsColumn(activeIndex = -1) {
  const col = columnFrame();
  fillW(col, inst("ColumnHeader", { action: "true", Title: tw("sidebar.headingChats") }, "Column header"));
  fillW(col, inst("Tabs", { value: "first", Count: "2" }, "Chats and saved"));
  fillW(col, inst("SearchField", { state: "default", filled: "false", Value: tw("sidebar.searchChats") }, "Search chats"));
  const list = frame("Conversations", { dir: "col", gap: 8, w: "fill", h: "fill", clip: true });
  D.CHATS.forEach((c, i) => add(list, chatCard(c, i === activeIndex)));
  add(col, list);
  list.children.forEach((card) => size(card, "fill"));
  return col;
}

function groupsColumn() {
  const col = columnFrame();
  fillW(col, inst("ColumnHeader", { action: "true", Title: tw("sidebar.headingGroups") }, "Column header"));
  fillW(col, inst("SearchField", { state: "default", filled: "false", Value: tw("sidebar.searchGroups") }, "Search groups"));
  fillW(col, inst("GroupRow", { state: "active", Name: D.GROUP.name, Count: String(D.GROUP.conversations) }, "Group"));
  return col;
}

function documentsColumn() {
  const col = columnFrame();
  fillW(col, inst("ColumnHeader", { action: "false", Title: tw("sidebar.headingDocuments") }, "Column header"));
  fillW(col, inst("SearchField", { state: "default", filled: "false", Value: tw("sidebar.searchDocuments") }, "Search documents"));
  const list = frame("Documents", { dir: "col", gap: 4, w: "fill" });
  for (const name of D.DOCUMENTS) fillW(list, inst("SidebarDocumentItem", { state: "default", Filename: name }, name));
  add(col, list);
  return col;
}

// ---------------------------------------------------------------------------------------------
// The page: bar, rounded panel with a scrolling area and the message box under it

/** The panel under a bar: `body` scrolls, `footer` is stuck to the bottom. */
function panel({ body, footer, centered = true, inset = "desktop" }) {
  const area = frame("Panel area", { dir: "col", pad: inset === "desktop" ? [0, 16, 16, 0] : [0, 16, 16, 16], w: "fill", h: "fill" });
  const p = frame("Panel", { dir: "col", radius: "lg", fill: "panel", clip: true, w: "fill", h: "fill" });
  const scroll = frame("Scroll area", { dir: "col", align: centered ? "center" : "start", w: "fill", h: "fill", clip: true });
  add(scroll, body);
  add(p, scroll);
  if (footer) {
    const foot = frame("Footer", { dir: "col", pad: [8, 0, 16, 0], align: "center", w: "fill" });
    add(foot, footer);
    add(p, foot);
  }
  add(area, p);
  return area;
}

/** The 736px column of a conversation (max 784 with its gutters), centred in the panel. */
function column(name, o = {}) {
  return frame(name, { dir: "col", gap: o.gap ?? 32, pad: o.pad || [24, 24], w: "fill", maxW: o.maxW || 784 });
}

/** The message box in its column: it starts 16px right of the avatar edge. */
function composerFooter(props, { narrow = false } = {}) {
  const col = frame("Composer column", { dir: "col", pad: narrow ? [0, 16, 0, 32] : [0, 24, 0, 40], w: "fill", maxW: 784 });
  const c = inst("Composer", { state: "default", attachments: "none", layout: narrow ? "narrow" : "wide", ...props }, "Composer");
  add(col, c);
  size(c, "fill");
  return col;
}

function pageColumn(header, area) {
  const left = frame("Page", { dir: "col", w: "fill", h: "fill" });
  fillW(left, header);
  add(left, area);
  return left;
}

/** The desktop window: rail, column and the page (with an optional side panel). */
function desktop({ section, column: col, page, aside }) {
  const root = frame("Desktop", { dir: "row", w: 1440, h: 900, clip: true, fill: "bg" });
  add(root, inst("Rail", { section }, "Rail"));
  add(root, col);
  const row = frame("Main", { dir: "row", w: "fill", h: "fill" });
  add(row, page);
  if (aside) add(row, aside);
  add(root, row);
  return root;
}

function barHeader(title, subtitle) {
  return inst("BarHeader", { Title: title, Subtitle: subtitle, "Show actions": false }, "Bar");
}

// ---------------------------------------------------------------------------------------------
// Messages

function question(text_, shape, time) {
  return inst("Message", { role: "question", shape, rating: "none", layout: "wide", Time: time }, "Question");
}

function questionMessage(t, shape, time) {
  const m = question(t, shape, time);
  nestedText(m, "Question", t, "Text");
  return m;
}

function answerMessage(body, { rating = "none", layout = "wide", time, sources } = {}) {
  const m = inst("Message", { role: "answer", shape: "full", rating, layout, Time: time, Body: body }, "Answer");
  if (sources) nestedText(m, "Sources button", sources);
  return m;
}

function turn(name, ...children) {
  const t = frame(name, { dir: "col", gap: 24, w: "fill" });
  for (const c of children) fillW(t, c);
  return t;
}

function separator(label) {
  return inst("DaySeparator", { Label: label }, "Day separator");
}

function conversationHeader(favourite, title) {
  return inst("ConversationHeader", { favourite: String(favourite), group: "true", Title: title, Subtitle: D.GROUP.name }, "Bar");
}

// ---------------------------------------------------------------------------------------------
// Screens

async function startDesktop() {
  const body = frame("Start", { dir: "col", w: "fill", maxW: 784 });
  fillW(body, inst("StartScreen", { layout: "wide" }, "Start screen"));
  const page = pageColumn(barHeader(tw("chat.newHeading"), tw("chat.newIntro")), panel({ body, footer: composerFooter({ scope: "all", Placeholder: tw("composer.placeholder") }) }));
  return desktop({ section: "chats", column: chatsColumn(-1), page });
}

async function startMobile() {
  const root = frame("Mobile", { dir: "col", w: 375, h: 812, clip: true, fill: "bg" });
  fillW(root, inst("MobileHeader", {}, "Mobile header"));
  const bar = inst("BarHeader", { Title: tw("chat.newHeading"), Subtitle: tw("chat.newIntro"), "Show actions": false }, "Bar");
  fillW(root, bar);
  const body = frame("Start", { dir: "col", w: "fill" });
  fillW(body, inst("StartScreen", { layout: "narrow" }, "Start screen"));
  const area = panel({ body, footer: composerFooter({ scope: "all", Placeholder: tw("composer.placeholder") }, { narrow: true }), inset: "mobile" });
  add(root, area);
  size(area, "fill", "fill");
  return root;
}

function chatBody(mobile) {
  const col = column("Messages", { pad: mobile ? [24, 16] : [24, 24] });
  if (!mobile) {
    fillW(col, turn("Turn 1", answerMessage(D.ANSWER_1, { rating: "up", time: "06:08", sources: tw("counts.citedSources", { count: 1 }) })));
  }
  const t2 = [];
  if (!mobile) t2.push(separator(tw("time.today")), questionMessage(D.QUESTION_2, "multiline", "07:33"));
  t2.push(
    mobile
      ? answerMessage(D.ANSWER_2, { layout: "narrow", time: "07:34" })
      : answerMessage(D.ANSWER_2, { time: "07:34" }),
  );
  fillW(col, turn("Turn 2", ...t2));
  return col;
}

async function chatDesktop() {
  const body = chatBody(false);
  const page = pageColumn(
    conversationHeader(true, D.CHATS[0].title),
    panel({ body, footer: composerFooter({ scope: "group", Placeholder: tw("composer.followUpPlaceholder") }) }),
  );
  return desktop({ section: "chats", column: chatsColumn(0), page, aside: inst("SourcesPanel", {}, "Sources panel") });
}

async function chatMobile() {
  const root = frame("Mobile", { dir: "col", w: 375, h: 812, clip: true, fill: "bg" });
  fillW(root, inst("MobileHeader", {}, "Mobile header"));
  fillW(root, conversationHeader(true, D.CHATS[0].title));
  const area = panel({ body: chatBody(true), footer: composerFooter({ scope: "group", Placeholder: tw("composer.followUpPlaceholder") }, { narrow: true }), inset: "mobile" });
  add(root, area);
  size(area, "fill", "fill");
  return root;
}

async function groupDesktop() {
  const body = column("Group lists", { pad: [24, 24], gap: 32 });
  const grid = frame("Conversations and documents", { dir: "row", gap: 32, w: "fill", align: "start" });
  const left = frame("Conversations", { dir: "col", gap: 12, w: "fill" });
  add(left, await text(tw("groups.conversations"), "App/Heading MD", "fg", { name: "Conversations heading" }));
  const rows = frame("Rows", { dir: "col", gap: 8, w: "fill" });
  for (const c of D.GROUP_CHATS) {
    fillW(rows, inst("ConversationRow", { favourite: String(!!c.favourite), Title: c.title, Time: c.time, Preview: c.preview }, c.title));
  }
  add(left, rows);
  const right = frame("Documents", { dir: "col", gap: 12, w: "fill" });
  add(right, await text(tw("groups.documents"), "App/Heading MD", "fg", { name: "Documents heading" }));
  const docs = frame("Rows", { dir: "col", gap: 8, w: "fill" });
  for (const name of D.DOCUMENTS.slice(0, 3)) fillW(docs, inst("GroupDocumentItem", { Filename: name }, name));
  add(right, docs);
  add(grid, left, right);
  size(left, "fill");
  size(right, "fill");
  add(body, grid);
  const header = inst("BarHeader", {
    Title: D.GROUP.name,
    Subtitle: `${tw("counts.conversations", { count: D.GROUP.conversations })} · ${tw("counts.documents", { count: D.GROUP.documents })}`,
  }, "Bar");
  const page = pageColumn(header, panel({ body, footer: composerFooter({ scope: "group", Placeholder: tw("composer.placeholder") }) }));
  return desktop({ section: "groups", column: groupsColumn(), page });
}

async function documentDesktop() {
  const body = column("Document", { pad: [24, 16], gap: 24, maxW: 896 });
  fillW(body, inst("DocumentStatus", { status: "ready" }, "Status"));
  add(body, await text(tw("documentView.intro"), "App/Body", "muted", { name: "Intro", w: "fill" }));
  fillW(body, inst("ChunkStats", {
    "Chunks value": D.DOC_STATS.chunks,
    "Average value": D.DOC_STATS.average,
    "Shortest value": D.DOC_STATS.shortest,
    "Longest value": D.DOC_STATS.longest,
    "Short value": D.DOC_STATS.short,
  }, "Chunk stats"));
  const chunks = frame("Chunks", { dir: "col", gap: 12, w: "fill" });
  add(chunks, await text(tw("documentView.chunks"), "App/Heading MD", "fg", { name: "Chunks heading" }));
  fillW(chunks, inst("TextInput", { size: "md", filled: "false", state: "default", Label: tw("documentView.filter"), Value: tw("documentView.filterPlaceholder") }, "Filter"));
  add(chunks, await text(tw("counts.chunksShown", { count: 7, total: 7 }), "App/Body", "muted", { name: "Count" }));
  const list = frame("Chunk list", { dir: "col", gap: 12, w: "fill" });
  for (const c of D.CHUNKS) {
    fillW(list, inst("ChunkCard", {
      short: String(!!c.short),
      Page: tw("documentView.page", { page: c.page }),
      Position: tw("documentView.position", { position: c.position }),
      Characters: tw("counts.characters", { count: c.chars }),
      Text: c.text,
    }, `Chunk ${c.page}.${c.position}`));
  }
  add(chunks, list);
  fillW(body, chunks);
  const header = inst("DocumentHeader", { Title: D.DOCUMENTS[0], Subtitle: `${tw("scope.version", { version: 1 })} · ${tw("counts.pages", { count: 5 })}` }, "Bar");
  const page = pageColumn(header, panel({ body }));
  return desktop({ section: "documents", column: documentsColumn(), page });
}

async function searchDesktop() {
  const body = column("Search lab", { pad: [24, 16], gap: 24, maxW: 896 });
  add(body, await text(tw("searchLab.intro"), "App/Body", "muted", { name: "Intro", w: "fill" }));
  const form = frame("Search form", { dir: "col", gap: 16, w: "fill" });
  fillW(form, inst("TextInput", { size: "md", filled: "true", state: "default", Label: tw("searchLab.question"), Value: D.SEARCH_QUESTION }, "Question"));
  const row = frame("Documents and results", { dir: "row", gap: 16, w: "fill", align: "start" });
  const select = inst("Select", { state: "default", Label: tw("searchLab.documents"), Value: tw("searchLab.allDocuments") }, "Documents");
  const limit = inst("TextInput", { size: "md", filled: "true", state: "default", Label: tw("searchLab.limit"), Value: "8" }, "Results");
  add(row, select, limit);
  size(select, "fill");
  size(limit, 128);
  add(form, row);
  size(row, "fill");
  fillW(form, inst("SearchModeSelect", { value: "hybrid" }, "Method"));
  add(form, inst("Button", { variant: "primary", size: "md", state: "default", Label: tw("searchLab.submit") }, "Search button"));
  add(body, form);
  size(form, "fill");
  const results = frame("Results", { dir: "col", gap: 12, w: "fill" });
  add(results, await text(tw("counts.results", { count: 5 }), "App/Heading MD", "fg", { name: "Results heading" }));
  add(results, await text(tw("searchLab.scoreNote"), "App/Body", "muted", { name: "Score note", w: "fill" }));
  const hits = frame("Hits", { dir: "col", gap: 12, w: "fill" });
  D.HITS.forEach((h, i) => {
    const ranks = h.vector === null ? "fulltext" : h.fulltext === null ? "vector" : "both";
    const card = inst("SearchHitCard", {
      ranks,
      Position: String(i + 1),
      Link: `${D.DOCUMENTS[0]}, ${tw("documentView.page", { page: h.page })}`,
      Passage: h.text,
    }, `Hit ${i + 1}`);
    nestedText(card, "Score badge", tw("searchLab.score", { score: h.score }));
    if (h.vector) nestedText(card, "Vector badge", tw("searchLab.vectorRank", { rank: h.vector[0], distance: h.vector[1] }));
    if (h.fulltext) nestedText(card, "Full-text badge", tw("searchLab.fulltextRank", { rank: h.fulltext }));
    fillW(hits, card);
  });
  add(results, hits);
  size(hits, "fill");
  add(body, results);
  size(results, "fill");
  const page = pageColumn(barHeader(tw("searchLab.title"), tw("searchLab.subtitle")), panel({ body }));
  const win = desktop({ section: "search", column: chatsColumn(-1), page });
  return win;
}

async function settingsDesktop() {
  const win = await startDesktop();
  const scrim = frame("Scrim", { dir: "col", align: "center", justify: "center", fill: "scrim", w: 1440, h: 900 });
  add(scrim, inst("SettingsDialog", {}, "Settings dialog"));
  add(win, scrim);
  scrim.layoutPositioning = "ABSOLUTE";
  scrim.x = 0;
  scrim.y = 0;
  return win;
}

export async function buildAppScreens(page, place) {
  await screenRow(page, place, "Start", [
    { name: "Start / Desktop", build: startDesktop },
    { name: "Start / Mobile", build: startMobile },
  ]);
  await screenRow(page, place, "Chat", [
    { name: "Chat / Desktop", build: chatDesktop },
    { name: "Chat / Mobile", build: chatMobile },
  ]);
  await screenRow(page, place, "Group", [{ name: "Group / Desktop", build: groupDesktop }]);
  await screenRow(page, place, "Document", [{ name: "Document / Desktop", build: documentDesktop }]);
  await screenRow(page, place, "Search lab", [{ name: "Search lab / Desktop", build: searchDesktop }]);
  await screenRow(page, place, "Settings", [{ name: "Settings / Desktop", build: settingsDesktop }]);
}
void setProps;
