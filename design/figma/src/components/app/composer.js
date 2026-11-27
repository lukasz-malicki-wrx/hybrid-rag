/** The message box: Composer, AttachmentChip, ComposerActions, ScopeTrigger, AnsweringIndicator lives in chat.js. */
import { textProp, setup } from "../../lib/components.js";
import { add, frame, shadow, size, text } from "../../lib/layout.js";
import { icon } from "../../lib/icons.js";
import { tw } from "../../lib/text.js";
import { listOf, variantSet, inst, iconBtn, button, ring, src } from "./shared.js";

async function buildAttachmentChip() {
  const table = {
    uploading: { icon: "Spinner", role: "muted", label: tw("document.uploading") },
    indexing: { icon: "Spinner", role: "muted", label: tw("document.indexing", { progress: 2, total: 5 }) },
    ready: { icon: "Check", role: "ok", label: tw("document.ready") },
    failed: { icon: "Alert", role: "danger", label: tw("document.processingFailed") },
  };
  const set = await variantSet(
    "AttachmentChip",
    listOf(Object.keys(table).map((status) => ({ status })), async (c, { status }) => {
      const s = table[status];
      setup(c, { dir: "row", gap: 8, pad: [4, 4, 4, 8], align: "center", radius: "lg", fill: "bg", stroke: "border" });
      add(c, icon("File", 18, "muted", "File icon"));
      add(c, await text("eu-gmp-annex11.pdf", "App/Body", "fg", { name: "Name", maxLines: 1 }));
      const st = frame("Status", { dir: "row", gap: 4, align: "center" });
      add(st, icon(s.icon, 14, s.role, "Status icon"));
      add(st, await text(s.label, "App/Caption", s.role, { name: "Status label" }));
      add(c, st);
      add(c, iconBtn("Close", { variant: "compact", name: "Remove button" }));
    }),
    { columns: 4, path: src("composer/attachment-chip.tsx"), description: "A PDF attached to the message being written: icon, name, its upload and indexing status (uploading, indexing with progress, ready, failed) and a remove button. Sending waits until every chip is ready." },
  );
  textProp(set, "Name", "eu-gmp-annex11.pdf");
}

async function buildScopeTrigger() {
  const table = {
    all: { icon: "Group", label: tw("scope.all") },
    group: { icon: "Group", label: tw("scope.group", { name: "GMP" }) },
    selected: { icon: "File", label: tw("scope.selected", { count: 2 }) },
  };
  await variantSet(
    "ScopeTrigger",
    listOf(Object.keys(table).map((scope) => ({ scope })), async (c, { scope }) => {
      const s = table[scope];
      setup(c, { dir: "row", gap: 6, pad: [0, 10], align: "center", radius: "lg", minH: 40, maxW: 256 });
      add(c, icon(s.icon, 18, "fg", "Icon"));
      add(c, await text(s.label, "App/Caption Medium", "fg", { name: "Label", maxLines: 1 }));
    }),
    { columns: 3, path: src("scope/scope-picker.tsx"), description: "The button in the message box that says what the next answer searches (all documents, a group, or N selected documents) and opens the scope dialog. Like Button chip-ghost, size field: transparent, text 12px medium, at most 256px wide." },
  );
}

async function buildComposerActions() {
  await variantSet(
    "ComposerActions",
    listOf(["send", "disabled", "stop"].map((mode) => ({ mode })), async (c, { mode }) => {
      if (mode === "stop") {
        const b = button("chip", "sm", tw("composer.stop"), { icon: "Stop", name: "Stop button" });
        setup(c, { dir: "row" });
        add(c, b);
        return;
      }
      setup(c, { dir: "row", w: 40, h: 40, align: "center", justify: "center", radius: "lg", fill: "accent" });
      if (mode === "disabled") c.opacity = 0.6; // disabled:opacity-60
      add(c, icon("Send", 18, "accent-fg", "Send icon"));
    }),
    { columns: 3, path: src("composer/composer-actions.tsx"), description: "Send (a 40px accent square with the paper plane; mode=disabled while the box is empty or a file is still indexing) or Stop (a chip button) while an answer is being written." },
  );
}

async function buildComposer() {
  const list = [];
  for (const scope of ["all", "group"]) for (const attachments of ["none", "one"]) for (const state of ["default", "focus"]) list.push({ scope, attachments, state, layout: "wide" });
  list.push({ scope: "all", attachments: "none", state: "default", layout: "narrow" }, { scope: "group", attachments: "none", state: "default", layout: "narrow" });
  const set = await variantSet(
    "Composer",
    listOf(list, async (c, { scope, attachments, state, layout }) => {
      const narrow = layout === "narrow";
      setup(c, { dir: "col", gap: 6, w: narrow ? 311 : 720 });
      const box = frame("Message box", { dir: "col", radius: "lg", fill: "bubble-user", stroke: state === "focus" ? undefined : "border", w: "fill" });
      if (state === "focus") ring(box);
      await shadow(box, "Shadow/Composer");
      if (attachments === "one") {
        const files = frame("Attached files", { dir: "row", gap: 8, wrap: true, pad: [12, 12, 0, 12], w: "fill" });
        add(files, inst("AttachmentChip", { status: "ready" }, "Attachment"));
        add(box, files);
      }
      const scopeBtn = inst("ScopeTrigger", { scope }, "Scope");
      const attach = frame("Attach", { dir: "row", w: 40, h: 40, align: "center", justify: "center" });
      add(attach, iconBtn("Paperclip", { variant: "default", name: "Add PDFs button" }));
      const field = frame("Message field", { dir: "row", pad: [8, 8], align: "center", minH: 40, w: "fill" });
      add(field, await text(tw("composer.followUpPlaceholder"), "App/Body", "muted", { name: "Placeholder", w: "fill" }));
      const send = inst("ComposerActions", { mode: "disabled" }, "Send");
      if (narrow) {
        const body = frame("Controls", { dir: "col", pad: 8, w: "fill" });
        const top = frame("Scope and attach", { dir: "row", gap: 4, align: "center", w: "fill" });
        add(top, scopeBtn, attach);
        const bottom = frame("Field and send", { dir: "row", gap: 4, align: "end", w: "fill" });
        add(bottom, field, send);
        add(body, top, bottom);
        add(box, body);
        size(field, "fill");
      } else {
        const row = frame("Controls", { dir: "row", gap: 4, pad: 8, align: "center", minH: 56, w: "fill" });
        add(row, scopeBtn, attach, field, send);
        add(box, row);
        size(field, "fill");
      }
      add(c, box);
      if (!narrow) {
        const hint = frame("Show hint", { dir: "row", pad: [0, 4], w: "fill" });
        add(hint, await text(tw("composer.hint"), "App/Caption", "muted", { name: "Hint", w: "fill" }));
        add(c, hint);
      }
    }),
    {
      columns: 4,
      path: src("composer/composer.tsx"),
      description:
        "The message box: a rounded bubble-user box with the Composer shadow, an optional row of attached files, then the scope button, the add-PDFs button, the text field and Send. state=focus is the focus ring. scope=all or group changes the scope label. layout=narrow is the phone, where the field and Send go to a second line. The hint under the box is hidden on phones.",
    },
  );
  textProp(set, "Placeholder", tw("composer.followUpPlaceholder"));
  textProp(set, "Hint", tw("composer.hint"));
}

export async function buildComposerParts() {
  await buildAttachmentChip();
  await buildScopeTrigger();
  await buildComposerActions();
  await buildComposer();
}
