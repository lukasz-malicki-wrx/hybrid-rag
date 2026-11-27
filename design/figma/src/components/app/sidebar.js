/** Sidebar and layout parts: Rail, RailItem, LanguageSwitch, ColumnHeader, list rows, MobileHeader. */
import { component, textProp, boolProp, swapProp, setup, instance } from "../../lib/components.js";
import { add, frame, size, text } from "../../lib/layout.js";
import { icon } from "../../lib/icons.js";
import { tw } from "../../lib/text.js";
import { STATES, STYLE, listOf, ring, variantSet, inst, iconBtn, button, absolute, src } from "./shared.js";

// ---------------------------------------------------------------------------------------------
// DocumentStatus (documents/document-status.tsx)

async function buildDocumentStatus() {
  const table = {
    ready: { icon: "Check", role: "ok", label: tw("document.ready") },
    failed: { icon: "Alert", role: "danger", label: tw("document.failed") },
    indexing: { icon: "Spinner", role: "muted", label: tw("document.indexing", { progress: 2, total: 5 }) },
    queued: { icon: "Spinner", role: "muted", label: tw("document.queued") },
  };
  await variantSet(
    "DocumentStatus",
    listOf(Object.keys(table).map((status) => ({ status })), async (c, { status }) => {
      const s = table[status];
      setup(c, { dir: "row", gap: 4, align: "center" });
      add(c, icon(s.icon, 14, s.role, "Icon"));
      add(c, await text(s.label, "App/Caption", s.role, { name: "Label" }));
    }),
    { path: src("documents/document-status.tsx"), description: "The processing state of a document: ready (green check), failed (red alert), indexing with progress or queued (muted spinner). 14px icon, 12px text." },
  );
}

// ---------------------------------------------------------------------------------------------
// Rail

async function buildRailItem() {
  const list = [];
  for (const active of ["true", "false"]) for (const state of ["default", "hover", "focus"]) list.push({ active, state });
  const set = await variantSet(
    "RailItem",
    listOf(list, async (c, { active, state }) => {
      const on = active === "true";
      const hover = state === "hover" && !on;
      setup(c, { dir: "row", w: 64, h: 32, align: "center", justify: "center", clip: false });
      const tile = frame("Tile", { dir: "row", w: 32, h: 32, align: "center", justify: "center", radius: "lg", fill: on ? "accent" : hover ? "surface-2" : "surface" });
      if (state === "focus") ring(tile);
      add(tile, icon("Chat", 18, on ? "accent-fg" : hover ? "fg" : "muted", "Icon"));
      add(c, tile);
      if (on) {
        // The marker at the window edge: 6x47, rounded on the right.
        const m = frame("Active marker", { dir: "none", fill: "accent", radius: "full", corners: ["topRight", "bottomRight"] });
        m.resize(6, 47);
        add(c, m);
        absolute(m, 0, -7.5);
      }
    }),
    {
      columns: 3,
      path: src("sidebar/rail-item.tsx"),
      description: "One item of the icon rail: a 32px tile (surface, muted icon) in a 64px wide row. active=true is the accent tile with the 6x47 marker at the window edge. The soft glow under the active tile (a coloured shadow) is not drawn: effect styles cannot follow a colour role.",
    },
  );
  swapProp(set, "Icon", "Chat");
}

async function buildLanguageSwitch() {
  const code = tw("languages.en").slice(0, 2).toUpperCase();
  const set = await variantSet(
    "LanguageSwitch",
    listOf([{ state: "default" }, { state: "hover" }, { state: "focus" }], async (c, { state }) => {
      setup(c, { dir: "row", w: 32, h: 32, align: "center", justify: "center", radius: "lg", fill: state === "hover" ? "surface-2" : "surface" });
      if (state === "focus") ring(c);
      add(c, await text(code, "App/Caption Semibold", state === "hover" ? "fg" : "muted", { name: "Code" }));
    }),
    { columns: 3, path: src("settings/language-switcher.tsx"), description: "The language tile of the rail: the two letter code of the current language over a transparent native select." },
  );
  textProp(set, "Code", code);
}

async function buildRail() {
  const sections = ["chats", "groups", "documents", "search"];
  const icons = { chats: "Chat", groups: "Group", documents: "File", search: "Search" };
  const set = await variantSet(
    "Rail",
    listOf(sections.map((section) => ({ section })), async (c, { section }) => {
      setup(c, { dir: "col", align: "center", pad: [16, 0], w: 64, h: 900, stroke: { role: "border", sides: ["right"] } });
      add(c, iconBtn("Sparkles", { variant: "accent", name: "Logo" }));
      const nav = frame("Navigation", { dir: "col", gap: 24, pad: [64, 0, 0, 0], align: "center", w: "fill" });
      for (const s of sections) {
        const item = instance("RailItem", { active: String(s === section), state: "default", Icon: icons[s] });
        item.name = `${tw(`rail.${s === "search" ? "searchLab" : s}`)} item`;
        add(nav, item);
      }
      add(c, nav);
      const grow = frame("Spacer", { dir: "col", w: 1, h: 1 });
      add(c, grow);
      size(grow, undefined, "fill");
      const bottom = frame("Settings, language and theme", { dir: "col", gap: 12, align: "center" });
      add(bottom, iconBtn("Settings", { name: "Settings button" }));
      add(bottom, inst("LanguageSwitch", { state: "default" }, "Language switch"));
      const hr = frame("Divider space", { dir: "col", pad: [4, 0], w: 32 });
      const d = inst("Divider");
      add(hr, d);
      size(d, "fill");
      add(bottom, hr);
      add(bottom, inst("ThemePill", { orientation: "vertical", dark: "false" }, "Theme switch"));
      add(c, bottom);
    }),
    {
      columns: 4,
      path: src("sidebar/rail.tsx"),
      description: "The 64px icon rail: the logo, one item per section (chats, groups, documents, search lab), then settings, language and the theme pill at the bottom. section marks the active item. Its right edge is a 1px border; it is as tall as the window.",
    },
  );
  void set;
}

// ---------------------------------------------------------------------------------------------
// Column

async function buildColumnHeader() {
  const set = await variantSet(
    "ColumnHeader",
    listOf([{ action: "true" }, { action: "false" }], async (c, { action }) => {
      setup(c, { dir: "row", gap: 8, align: "center", justify: "between", w: 288, h: 32 });
      add(c, await text(tw("sidebar.headingChats"), "App/Bar", "fg", { name: "Title", w: "fill", maxLines: 1 }));
      if (action === "true") add(c, iconBtn("Plus", { variant: "accent", name: "Action" }));
    }),
    { path: src("sidebar/column-header.tsx"), description: "The title of a sidebar section (20px bold) with an optional 32px accent action on the right (new chat, new group). Documents has none." },
  );
  textProp(set, "Title", tw("sidebar.headingChats"));
}

async function buildConversationCard() {
  const list = [];
  for (const favourite of ["false", "true"]) for (const state of ["default", "hover", "active"]) list.push({ state, favourite });
  const set = await variantSet(
    "ConversationCard",
    listOf(list, async (c, { state, favourite }) => {
      setup(c, { dir: "col", gap: 4, pad: [12, 16], radius: "lg", w: 288, minH: 88, fill: state === "default" ? undefined : "surface-2" });
      const row = frame("Title row", { dir: "row", gap: 8, align: "center", w: "fill" });
      add(row, favourite === "true" ? icon("Star", 12, "accent", "Favourite") : icon("Chat", 12, "muted", "Chat"));
      add(row, await text(tw("sidebar.headingChats"), "App/Body Semibold", "fg", { name: "Title", w: "fill", maxLines: 1 }));
      add(row, await text("07:34", "App/Caption", "muted", { name: "Time" }));
      add(c, row);
      add(c, await text(tw("sidebar.noPreview"), "App/Preview", "muted", { name: "Preview", w: "fill", maxLines: 2 }));
    }),
    {
      columns: 3,
      path: src("sidebar/conversation-card.tsx"),
      description: "A chat in the sidebar list: icon, title and time on one line, then two lines of the latest answer. state=active is the open chat (surface-2). favourite=true shows the star in the accent colour instead of the chat icon (the star is drawn as an outline: icons are strokes).",
    },
  );
  textProp(set, "Title", tw("sidebar.headingChats"));
  textProp(set, "Time", "07:34");
  textProp(set, "Preview", tw("sidebar.noPreview"));
}

async function buildSidebarDocumentItem() {
  const set = await variantSet(
    "SidebarDocumentItem",
    listOf([{ state: "default" }, { state: "hover" }], async (c, { state }) => {
      setup(c, { dir: "row", gap: 8, pad: [8, 16], align: "center", radius: "lg", w: 288, minH: 40, fill: state === "hover" ? "surface-2" : undefined });
      add(c, icon("File", 12, "muted", "Icon"));
      const body = frame("Text", { dir: "col", w: "fill" });
      add(body, await text(tw("sidebar.headingDocuments"), "App/Body Medium", "fg", { name: "Filename", w: "fill", maxLines: 1 }));
      add(body, inst("DocumentStatus", { status: "ready" }, "Status"));
      add(c, body);
    }),
    { path: src("sidebar/sidebar-document-item.tsx"), description: "A document in the sidebar: a small file icon, the filename (a link when it is ready) and its processing status." },
  );
  textProp(set, "Filename", tw("sidebar.headingDocuments"));
}

async function buildSidebarEmpty() {
  const c = await component(
    "SidebarEmpty",
    async (c) => {
      setup(c, { dir: "row", pad: [8, 4], w: 288 });
      add(c, await text(tw("sidebar.noDocuments"), "App/Body", "muted", { name: "Message", w: "fill" }));
    },
    { path: src("sidebar/sidebar-empty.tsx"), description: "The one line shown in a list column when there is nothing to show (empty, no match, load error)." },
  );
  textProp(c, "Message", tw("sidebar.noDocuments"));
}

async function buildGroupRow() {
  const set = await variantSet(
    "GroupRow",
    listOf(["default", "hover", "active"].map((state) => ({ state })), async (c, { state }) => {
      setup(c, { dir: "row", gap: 8, pad: [8, 16], align: "center", radius: "lg", w: 288, minH: 40, fill: state === "default" ? undefined : "surface-2" });
      add(c, icon("Group", 12, "muted", "Icon"));
      add(c, await text(tw("sidebar.groups"), state === "active" ? "App/Body Semibold" : "App/Body", "fg", { name: "Name", w: "fill", maxLines: 1 }));
      add(c, await text("4", "App/Caption", "muted", { name: "Count" }));
    }),
    { columns: 3, path: src("sidebar/groups-section.tsx"), description: "A group in the Groups list: folder icon, name and the number of its conversations. state=active is the open group (surface-2, semibold)." },
  );
  textProp(set, "Name", tw("sidebar.groups"));
  textProp(set, "Count", "4");
}

// ---------------------------------------------------------------------------------------------
// Headers

async function buildMobileHeader() {
  await component(
    "MobileHeader",
    async (c) => {
      setup(c, { dir: "row", gap: 8, pad: [0, 8], align: "center", w: 375, h: 48, stroke: { role: "border", sides: ["bottom"] } });
      add(c, iconBtn("Menu", { variant: "default", tone: "strong", name: "Menu button" }));
      add(c, await text(tw("app.name"), "App/Heading SM", "fg", { name: "App name" }));
    },
    { path: src("layout/mobile-header.tsx"), description: "The 48px bar on phones (below lg) with the menu button that opens the sidebar drawer. It has a bottom border; from lg the rail takes its place." },
  );
}

async function buildConversationHeader() {
  const set = await variantSet(
    "ConversationHeader",
    listOf([{ favourite: "true", group: "true" }, { favourite: "false", group: "true" }, { favourite: "false", group: "false" }, { favourite: "true", group: "false" }], async (c, { favourite, group }) => {
      setup(c, { dir: "row", gap: 8, pad: [0, 16], align: "center", w: 720, h: 64 });
      const left = frame("Heading", { dir: "col", w: "fill" });
      add(left, await text(tw("chat.newHeading"), "App/Bar", "fg", { name: "Title", w: "fill", maxLines: 1 }));
      const sub = frame("Subtitle", { dir: "row", gap: 4, align: "center", w: "fill" });
      if (group === "true") add(sub, icon("Group", 14, "muted", "Group icon"));
      add(sub, await text(group === "true" ? tw("sidebar.groups") : tw("counts.questions", { count: 2 }), "App/Caption", "muted", { name: "Subtitle", w: "fill", maxLines: 1 }));
      add(left, sub);
      add(c, left);
      const actions = frame("Actions", { dir: "row", gap: 8, align: "center" });
      add(actions, iconBtn("Star", { state: favourite === "true" ? "pressed" : "default", name: "Favourite button" }));
      add(actions, iconBtn("Trash", { tone: "danger", name: "Delete button" }));
      add(c, actions);
    }),
    {
      columns: 2,
      path: src("chat/conversation-header.tsx"),
      description: "The bar of a conversation: the title, a subtitle that is the group (link with folder icon) or the number of questions, and two tile buttons: favourite (pressed = accent star) and delete (turns red on hover). Same layout as BarHeader.",
    },
  );
  textProp(set, "Title", tw("chat.newHeading"));
  textProp(set, "Subtitle", tw("sidebar.groups"));
}

async function buildDocumentHeader() {
  const set = await component(
    "DocumentHeader",
    async (c) => {
      setup(c, { dir: "row", gap: 8, pad: [0, 16], align: "center", w: 720, h: 64 });
      const left = frame("Heading", { dir: "col", w: "fill" });
      add(left, await text(tw("sidebar.headingDocuments"), "App/Bar", "fg", { name: "Title", w: "fill", maxLines: 1 }));
      add(left, await text(tw("scope.version", { version: 1 }), "App/Caption", "muted", { name: "Subtitle", w: "fill", maxLines: 1 }));
      add(c, left);
      add(c, button("tile", "tile", tw("documentView.openPdf"), { icon: "External", name: "Open PDF button" }));
    },
    { path: src("documents/document-view.tsx"), description: "The bar of a document: filename, a subtitle with version and page count, and the Open PDF tile button (only when the document is ready). The BarHeader layout with a text button as its action." },
  );
  textProp(set, "Title", tw("sidebar.headingDocuments"));
  textProp(set, "Subtitle", tw("scope.version", { version: 1 }));
}

export async function buildSidebarParts() {
  await buildDocumentStatus();
  await buildRailItem();
  await buildLanguageSwitch();
  await buildRail();
  await buildColumnHeader();
  await buildConversationCard();
  await buildSidebarDocumentItem();
  await buildSidebarEmpty();
  await buildGroupRow();
  await buildMobileHeader();
  await buildConversationHeader();
  await buildDocumentHeader();
}
void STATES;
void STYLE;
void boolProp;
