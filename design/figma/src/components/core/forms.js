/**
 * Form controls of packages/ui: Checkbox, Radio, RadioGroup, Field, Select, TextInput, TextArea,
 * SearchField and Tabs.
 */
import { component, textProp, boolProp, setup, instance } from "../../lib/components.js";
import { add, frame, shadow, text } from "../../lib/layout.js";
import { stroke } from "../../lib/tokens.js";
import { icon } from "../../lib/icons.js";
import { tw } from "../../lib/text.js";
import { STATES, listOf, ring, variantSet } from "./shared.js";

/** The focus ring or the disabled look of a control (disabled: opacity 0.6, like Button). */
function stateLook(node, state) {
  if (state === "focus") ring(node);
  if (state === "disabled") node.opacity = 0.6;
}

/** A text-field box: border, bg, rounded-lg, px-3 py-1.5. */
function fieldBox(name, o = {}) {
  return frame(name, { dir: "row", gap: 8, pad: [6, 12], align: "center", radius: "lg", fill: "bg", stroke: "border", w: "fill", minH: o.minH });
}

async function labelRow(content) {
  const wrap = frame("Show label", { dir: "row", w: "fill" });
  add(wrap, await text(content, "App/Body Medium", "fg", { name: "Label" })); // FIELD_LABEL: text-sm font-medium
  return wrap;
}

// ---------------------------------------------------------------------------------------------
// Checkbox, Radio, RadioGroup

function choiceBox(kind, checked) {
  const box = frame(kind === "radio" ? "Radio" : "Checkbox", {
    dir: "row",
    align: "center",
    justify: "center",
    w: 16,
    h: 16,
    radius: kind === "radio" ? "full" : "sm",
    fill: checked ? "accent" : "bg",
  });
  if (!checked) stroke(box, "muted", 1);
  if (checked && kind === "checkbox") add(box, icon("Check", 12, "accent-fg", "Check"));
  if (checked && kind === "radio") add(box, frame("Dot", { dir: "row", w: 6, h: 6, radius: "full", fill: "accent-fg" }));
  return box;
}

function choiceRow(c, state) {
  setup(c, { dir: "row", gap: 12, pad: [0, 8], align: "center", radius: "lg", fill: state === "hover" ? "surface-2" : undefined, minH: 40, w: 288 });
  stateLook(c, state);
}

async function buildChoices() {
  const list = [];
  for (const checked of ["false", "true"]) for (const state of STATES) list.push({ checked, state });

  const cb = await variantSet(
    "Checkbox",
    listOf(list, async (c, { checked, state }) => {
      choiceRow(c, state);
      add(c, choiceBox("checkbox", checked === "true"));
      const body = frame("Text", { dir: "col", w: "fill" });
      add(body, await text(tw("scope.documents"), "App/Body", "fg", { name: "Label", w: "fill" }));
      const d = frame("Show description", { dir: "row", w: "fill" });
      add(d, await text(tw("scope.stillIndexing"), "App/Caption", "muted", { name: "Description", w: "fill" }));
      add(body, d);
      add(c, body);
    }),
    {
      columns: 4,
      path: "packages/ui/src/components/checkbox.tsx",
      description: "A checkbox whose whole row is the label (min height 40). The optional description sits under the label in muted 12 px.",
    },
  );
  textProp(cb, "Label", tw("scope.documents"));
  textProp(cb, "Description", tw("scope.stillIndexing"));
  boolProp(cb, "Show description", false);

  const rd = await variantSet(
    "Radio",
    listOf(list, async (c, { checked, state }) => {
      choiceRow(c, state);
      add(c, choiceBox("radio", checked === "true"));
      add(c, await text(tw("settings.appearanceLight"), "App/Body", "fg", { name: "Label", w: "fill" }));
    }),
    { columns: 4, path: "packages/ui/src/components/radio.tsx", description: "A radio button with a large click target (the whole row, min height 40)." },
  );
  textProp(rd, "Label", tw("settings.appearanceLight"));

  const group = await component(
    "RadioGroup",
    async (c) => {
      setup(c, { dir: "col", gap: 6, w: 288 });
      add(c, await text(tw("settings.appearance"), "App/Body Medium", "fg", { name: "Legend" }));
      const items = [
        ["true", "settings.appearanceLight"],
        ["false", "settings.appearanceDark"],
        ["false", "settings.appearanceSystem"],
      ];
      for (const [checked, key] of items) {
        const r = instance("Radio", { checked, state: "default", Label: tw(key) });
        r.name = "Option";
        add(c, r);
      }
    },
    { path: "packages/ui/src/components/radio-group.tsx", description: "A labelled set of radio buttons (fieldset with a legend). Choose the checked option on each Radio instance." },
  );
  textProp(group, "Legend", tw("settings.appearance"));
}

// ---------------------------------------------------------------------------------------------
// Field, TextInput, TextArea, Select, SearchField

async function buildFieldControls() {
  const field = await component(
    "Field",
    async (c) => {
      setup(c, { dir: "col", gap: 6, w: 288 });
      add(c, await labelRow(tw("sidebar.groupName")));
      add(c, fieldBox("Control", { minH: 40 }));
    },
    { path: "packages/ui/src/components/field.tsx", description: "A label above its control with a 6px gap: the layout every labelled field uses. Replace the Control with the real input; Show label off hides the label (it stays for screen readers)." },
  );
  textProp(field, "Label", tw("sidebar.groupName"));
  boolProp(field, "Show label", true);

  const inputs = [];
  for (const state of ["default", "focus", "disabled"]) {
    inputs.push({ size: "md", filled: "false", state }, { size: "md", filled: "true", state });
  }
  for (const state of ["default", "focus", "disabled"]) inputs.push({ size: "title", filled: "true", state });
  const ti = await variantSet(
    "TextInput",
    listOf(inputs, async (c, { size, filled, state }) => {
      setup(c, { dir: "col", gap: 6, w: 288 });
      add(c, await labelRow(tw("searchLab.question")));
      const box = fieldBox("Input");
      stateLook(box, state);
      add(box, await text(tw("searchLab.placeholder"), size === "title" ? "App/Bar" : "App/Body", filled === "true" ? "fg" : "muted", { name: "Value", w: "fill" }));
      add(c, box);
    }),
    {
      columns: 3,
      path: "packages/ui/src/components/text-input.tsx",
      description: 'A single-line input with its label. size="title" renames a heading in place (20px bold). Filled shows a typed value, otherwise the text is the placeholder (muted).',
    },
  );
  textProp(ti, "Label", tw("searchLab.question"));
  textProp(ti, "Value", tw("searchLab.placeholder"));
  boolProp(ti, "Show label", true);

  const ta = await variantSet(
    "TextArea",
    listOf(listOfStates(["default", "focus", "disabled"]), async (c, { state }) => {
      setup(c, { dir: "col", gap: 6, w: 288 });
      add(c, await labelRow(tw("settings.personalContext")));
      const hint = frame("Show hint", { dir: "row", w: "fill" });
      add(hint, await text(tw("settings.personalContextHint"), "App/Body", "muted", { name: "Hint", w: "fill" }));
      add(c, hint);
      const box = frame("Textarea", { dir: "col", pad: [8, 12], radius: "lg", fill: "bg", stroke: "border", w: "fill", minH: 80 });
      stateLook(box, state);
      add(box, await text(tw("settings.personalContextPlaceholder"), "App/Body", "muted", { name: "Value", w: "fill" }));
      add(c, box);
      const foot = frame("Show footer", { dir: "row", justify: "end", w: "fill" });
      add(foot, await text(tw("settings.characters", { count: 0, max: 2000 }), "App/Caption", "muted", { name: "Footer" }));
      add(c, foot);
    }),
    {
      columns: 3,
      path: "packages/ui/src/components/text-area.tsx",
      description: "A multi-line input with a label, an optional hint above it and an optional footer (a character counter) under it, right aligned. It grows vertically.",
    },
  );
  textProp(ta, "Label", tw("settings.personalContext"));
  textProp(ta, "Hint", tw("settings.personalContextHint"));
  textProp(ta, "Value", tw("settings.personalContextPlaceholder"));
  textProp(ta, "Footer", tw("settings.characters", { count: 0, max: 2000 }));
  boolProp(ta, "Show hint", true);
  boolProp(ta, "Show footer", true);

  const sel = await variantSet(
    "Select",
    listOf(listOfStates(["default", "focus", "disabled"]), async (c, { state }) => {
      setup(c, { dir: "col", gap: 6, w: 288 });
      add(c, await labelRow(tw("searchLab.documents")));
      const box = fieldBox("Select", { minH: 40 });
      stateLook(box, state);
      add(box, await text(tw("searchLab.allDocuments"), "App/Body", "fg", { name: "Value", w: "fill" }));
      add(box, icon("ChevronDown", 16, "muted", "Chevron"));
      add(c, box);
    }),
    { columns: 3, path: "packages/ui/src/components/select.tsx", description: "A native select with its label (min height 40). The chevron is the browser's arrow." },
  );
  textProp(sel, "Label", tw("searchLab.documents"));
  textProp(sel, "Value", tw("searchLab.allDocuments"));
  boolProp(sel, "Show label", true);

  const sf = await variantSet(
    "SearchField",
    listOf(
      [
        { state: "default", filled: "false" },
        { state: "default", filled: "true" },
        { state: "focus", filled: "false" },
        { state: "focus", filled: "true" },
      ],
      async (c, { state, filled }) => {
        setup(c, { dir: "row", gap: 8, pad: [0, 12], align: "center", radius: "lg", fill: "surface", w: 288, h: 32 });
        if (state === "focus") ring(c);
        add(c, icon("Search", 12, "muted", "Icon"));
        add(c, await text(tw("sidebar.searchChats"), "App/Body Medium", filled === "true" ? "fg" : "muted", { name: "Value", w: "fill" }));
      },
    ),
    { columns: 2, path: "packages/ui/src/components/search-field.tsx", description: "The 32px search box of the sidebar: a leading icon, a medium 14px text. The label is read aloud only, so none is drawn." },
  );
  textProp(sf, "Value", tw("sidebar.searchChats"));
}

function listOfStates(states) {
  return states.map((state) => ({ state }));
}

// ---------------------------------------------------------------------------------------------

async function buildTabs() {
  const set = await variantSet(
    "Tabs",
    listOf([{ value: "first" }, { value: "second" }], async (c, { value }) => {
      setup(c, { dir: "row", gap: 4, pad: 4, align: "center", radius: "lg", fill: "surface-2", stroke: "border", w: 288, h: 48 });
      for (const [key, which, name] of [
        ["first", 0, "First tab"],
        ["second", 1, "Second tab"],
      ]) {
        const selected = value === key;
        const tab = frame(name, { dir: "row", gap: 8, pad: [0, 8], align: "center", justify: "center", radius: "md", fill: selected ? "bg" : undefined, w: "fill", h: 40 });
        const label = await text(tw(which === 0 ? "sidebar.tabChats" : "sidebar.tabSaved"), "App/Caption Semibold", selected ? "accent" : "muted", { name: which === 0 ? "First label" : "Second label" });
        label.textCase = "UPPER";
        add(tab, label);
        if (which === 1) {
          const count = frame("Show count", { dir: "row", pad: [2, 6], radius: "sm", fill: "surface-2" });
          add(count, await text("3", "App/Caption Medium", "fg", { name: "Count" }));
          add(tab, count);
        }
        if (selected) await shadow(tab, "Shadow/SM");
        add(c, tab);
      }
    }),
    {
      path: "packages/ui/src/components/tabs.tsx",
      description: "Tabs that switch a list in place (the sidebar's Chats / Saved): a surface-2 track, the selected tab is bg with an accent label. value=first or second picks the selected tab; the second tab can show a count.",
    },
  );
  textProp(set, "First label", tw("sidebar.tabChats"));
  textProp(set, "Second label", tw("sidebar.tabSaved"));
  textProp(set, "Count", "3");
  boolProp(set, "Show count", true);
}

export async function buildForms() {
  await buildChoices();
  await buildFieldControls();
  await buildTabs();
}
