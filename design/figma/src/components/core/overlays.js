/**
 * Dialog, ConfirmDialog, BarHeader and the notices: Toast and Inline alert. They use Button and
 * IconButton instances, so they are built after those.
 */
import { component, textProp, boolProp, setup, instance, setProps } from "../../lib/components.js";
import { add, frame, shadow, text } from "../../lib/layout.js";
import { icon } from "../../lib/icons.js";
import { tw } from "../../lib/text.js";
import { listOf, variantSet } from "./shared.js";

const WIDTHS = { md: 448, lg: 512, xl: 576 }; // max-w-md / lg / xl

function button(variant, label, state = "default") {
  const b = instance("Button", { variant, size: "md", state, Label: label });
  b.name = `${label} button`;
  return b;
}

/** The dialog of dialog.tsx: header (title, description), body, footer, border-b / border-t between them. */
async function drawDialog(c, o) {
  setup(c, { dir: "col", fill: "bg", radius: "xl", stroke: "border", w: o.width, clip: true });
  await shadow(c, "Shadow/XL");
  const head = frame("Header", { dir: "col", gap: 4, pad: [16, 24], w: "fill", stroke: { role: "border", sides: ["bottom"] } });
  add(head, await text(o.title, "App/Heading MD", "fg", { name: "Title", w: "fill" }));
  const d = frame("Show description", { dir: "row", w: "fill" });
  add(d, await text(o.description, "App/Body", "muted", { name: "Description", w: "fill" }));
  add(head, d);
  add(c, head);
  if (o.body) {
    const body = frame("Show body", { dir: "col", pad: [16, 24], w: "fill" });
    add(body, await text(o.body, "App/Body", "fg", { name: "Body", w: "fill" }));
    add(c, body);
  }
  const foot = frame("Show footer", { dir: "row", gap: 12, wrap: true, justify: "end", align: "center", pad: [16, 24], w: "fill", stroke: { role: "border", sides: ["top"] } });
  add(foot, o.buttons());
  add(c, foot);
}

async function buildDialogs() {
  const dialog = await variantSet(
    "Dialog",
    listOf(Object.keys(WIDTHS).map((size) => ({ size })), (c, { size }) =>
      drawDialog(c, {
        width: WIDTHS[size],
        title: tw("scope.title"),
        description: tw("scope.hintAll"),
        body: tw("scope.empty"),
        buttons: () => [button("secondary", tw("common.cancel")), button("primary", tw("common.save"))],
      }),
    ),
    {
      path: "packages/ui/src/components/dialog.tsx",
      description: "A modal dialog (native <dialog>): rounded-xl, bg, shadow-xl, a title with an optional description, a scrolling body and a footer with the actions on the right. size sets the maximum width (448, 512, 576).",
    },
  );
  textProp(dialog, "Title", tw("scope.title"));
  textProp(dialog, "Description", tw("scope.hintAll"));
  textProp(dialog, "Body", tw("scope.empty"));
  boolProp(dialog, "Show description", true);
  boolProp(dialog, "Show body", true);
  boolProp(dialog, "Show footer", true);

  const confirm = await variantSet(
    "ConfirmDialog",
    listOf([{ busy: "false" }, { busy: "true" }], (c, { busy }) =>
      drawDialog(c, {
        width: WIDTHS.md,
        title: tw("chat.deleteTitle"),
        description: tw("chat.deleteBody", { title: tw("start.title") }),
        buttons: () => [button("secondary", tw("common.cancel")), button("danger", tw("chat.deleteConversation"), busy === "true" ? "disabled" : "default")],
      }),
    ),
    {
      path: "packages/ui/src/components/confirm-dialog.tsx",
      description: "Destructive confirmation: a Dialog with Cancel (it has the initial focus, so Enter does not delete) and a danger button. busy=true disables the danger button while the request runs.",
    },
  );
  textProp(confirm, "Title", tw("chat.deleteTitle"));
  textProp(confirm, "Description", tw("chat.deleteBody", { title: tw("start.title") }));
}

// ---------------------------------------------------------------------------------------------

async function buildBarHeader() {
  const set = await component(
    "BarHeader",
    async (c) => {
      setup(c, { dir: "row", gap: 8, pad: [0, 16], align: "center", w: 720, h: 64 });
      const left = frame("Heading", { dir: "col", w: "fill" });
      add(left, await text(tw("searchLab.title"), "App/Bar", "fg", { name: "Title", w: "fill", maxLines: 1 }));
      const sub = frame("Show subtitle", { dir: "row", w: "fill" });
      add(sub, await text(tw("searchLab.subtitle"), "App/Caption", "muted", { name: "Subtitle", w: "fill", maxLines: 1 }));
      add(left, sub);
      add(c, left);
      const actions = frame("Show actions", { dir: "row", gap: 8, align: "center" });
      for (const name of ["Pencil", "Trash"]) {
        const b = instance("IconButton", { variant: "tile", tone: "default", state: "default" });
        setProps(b, { Icon: name });
        b.name = `${name} action`;
        add(actions, b);
      }
      add(c, actions);
    },
    {
      path: "packages/ui/src/components/bar-header.tsx",
      description: "The 64px bar at the top of a pane: the title (with an optional one-line subtitle) on the left, tile buttons on the right. Bars side by side should all have a subtitle or all not.",
    },
  );
  textProp(set, "Title", tw("searchLab.title"));
  textProp(set, "Subtitle", tw("searchLab.subtitle"));
  boolProp(set, "Show subtitle", true);
  boolProp(set, "Show actions", true);
}

// ---------------------------------------------------------------------------------------------
// Notices

async function buildToast() {
  const set = await variantSet(
    "Toast",
    listOf([{ tone: "info" }, { tone: "error" }], async (c, { tone }) => {
      const error = tone === "error";
      setup(c, { dir: "row", pad: [8, 16], radius: "lg", fill: error ? "bg" : "surface-2", stroke: error ? "danger" : "border", w: 384 });
      await shadow(c, "Shadow/LG");
      add(c, await text(tw("settings.saved"), "App/Body", error ? "danger" : "fg", { name: "Message", w: "fill" }));
    }),
    {
      path: "apps/web/src/features/layout/toaster.tsx",
      description: "A notification in the live region at the bottom right (6 seconds). tone=info is a plain message, tone=error is the red one (notify.warn and notify.error). The code has only these two tones.",
    },
  );
  textProp(set, "Message", tw("settings.saved"));
}

async function buildInlineAlert() {
  const set = await variantSet(
    "Inline alert",
    listOf([{ tone: "error" }, { tone: "warning" }, { tone: "success" }, { tone: "progress" }], async (c, { tone }) => {
      const label = tw("errors.generic");
      if (tone === "error") {
        // live-turn.tsx: role="alert", 16px icon, danger text
        setup(c, { dir: "row", gap: 4, align: "center" });
        add(c, icon("Alert", 16, "danger", "Icon"));
        add(c, await text(label, "App/Body", "danger", { name: "Label" }));
      } else if (tone === "warning") {
        // answer-flags.tsx: a warn Badge
        setup(c, { dir: "row", gap: 4, pad: [2, 8], align: "center", radius: "full", fill: "warn-bg" });
        add(c, icon("Alert", 14, "warn-fg", "Icon"));
        add(c, await text(label, "App/Caption", "warn-fg", { name: "Label" }));
      } else {
        // document-status.tsx: 14px icon, 12px text
        const role = tone === "success" ? "ok" : "muted";
        setup(c, { dir: "row", gap: 4, align: "center" });
        add(c, icon(tone === "success" ? "Check" : "Spinner", 14, role, "Icon"));
        add(c, await text(label, "App/Caption", role, { name: "Label" }));
      }
    }),
    {
      path: "apps/web/src/features/chat/live-turn.tsx",
      description:
        "A notice in the flow of the page. error: a failed answer (live-turn.tsx); warning: an answer flag such as not found or no citations (answer-flags.tsx); success and progress: the status of a document (document-status.tsx). Field errors do not exist in the code: fields have no error state.",
    },
  );
  textProp(set, "Label", tw("errors.generic"));
}

export async function buildOverlays() {
  await buildDialogs();
  await buildBarHeader();
  await buildToast();
  await buildInlineAlert();
}
