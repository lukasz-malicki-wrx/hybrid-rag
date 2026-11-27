# Brief for agents: the hybrid-rag Figma generator

You extend a Figma plugin that draws hybrid-rag's design system, landing page and app into a
Figma file. It runs once in Figma Desktop; you cannot see Figma, so you work from the code and test
with a strict mock of the Figma API.

## How it works
- `design/figma/build.mjs` reads tokens, texts, icons and screenshots from the repo into
  `src/generated/data.js` and bundles `src/main.js` into `dist/code.js`.
- `node design/figma/build.mjs && node design/figma/test/run.mjs` builds and runs the plugin on the
  mock twice (with and without variable modes). It must end with "✓ no problems" both times.
  Run it after every meaningful change. If the mock rejects something real Figma allows, say so in
  your report rather than weakening the mock.
- Read `src/main.js` and everything in `src/lib/` before writing code. Use only those helpers:
  - `frame(name, opts)`, `text(content, style, role, opts)` (async), `add(parent, ...children)`,
    `size(node, w, h)`, `rule()`, `shadow(node, "Shadow/LG")` from `lib/layout.js`
  - `fill/stroke/strokeSides/space/padding/radius/layoutSpace/paint` from `lib/tokens.js`
  - `component`, `variants`, `textProp`, `boolProp`, `swapProp`, `instance`, `setProps`, `setup`, `get`
    from `lib/components.js`
  - `icon(name, size, role, layerName)`, `tintIcon` from `lib/icons.js`
  - `tw(key)`, `tl(file, key)`, `tlRaw`, `twRaw` from `lib/text.js`
  - `shot(name, scheme, width)` from `lib/images.js`; `screenRow`, `placer`, `board` from `lib/pages.js`

## Rules (the user is strict about these)
1. **Colours only through roles** (`bg`, `surface`, `surface-2`, `fg`, `muted`, `border`, `accent`,
   `accent-fg`, `danger`, `danger-fg`, `warn-bg`, `warn-fg`, `ok`, `focus`, `mark`, `mark-fg`, `ai`,
   `panel`, `bubble-user`, `bubble-ai`, `card-raised`, `chip`, `band`, `band-fg`, `band-muted`).
   Never a hex value, never `{r,g,b}`. Hover = the code's hover class mapped to a role (e.g.
   `hover:bg-surface-2`); `hover:opacity-90` = node opacity 0.9.
2. **Every gap and padding through the spacing scale** (`lib/tokens.js` SPACING). Tailwind unit × 4
   = px: `px-4` = 16, `gap-1.5` = 6, `py-2.5` = 10. Radius by Tailwind 4 name: `rounded` and
   `rounded-sm` = sm (4), `rounded-md` = md (6), `rounded-lg` = lg (8), `rounded-xl` = xl (12),
   `rounded-2xl` = 2xl (16), `rounded-full` = full. Heights: `min-h-11` = 44, `h-6` = 24, `size-10` = 40.
3. **Every text through a text style** (`lib/styles.js`). Tailwind `text-xs` = 12/16, `text-sm` =
   14/20, `text-base` = 16/24, `text-lg` = 18/28, `text-xl` = 20/28. Pick the style with the matching
   size and weight. Never below 12 px.
4. **Product texts only from the catalogs** via `tw()` / `tl()`. Never type a product string. If a
   string you need is missing from the catalogs, use the closest real one and mention it in the
   report. Documentation labels on the Design System page (e.g. "Colours", "variant=primary") are
   design notes and may be plain English.
5. **Mirror the code exactly.** For every component open its source file and translate its
   Tailwind classes 1:1 (padding, gap, radius, border, size, colour, weight). Put the source path in
   the `path` option and a one-sentence `description` of when to use it. The app's version
   (`packages/ui`, `apps/web`) wins over any other design. `docs/FIGMA_REDESIGN_PLAN.md` §3 has the
   measured sizes of the app frame (rail 64, column 320, chat row 88 ...).
6. **Senior Figma practice**: auto layout everywhere (no absolute positions except true overlays
   such as a badge on a corner), components with variant properties named as the code's props
   (lowercase values: `variant=primary, size=md, state=default`), text/boolean/instance-swap
   properties for labels and icons, layer names that say what a layer is (no "Frame 12"), states
   as variants (`default`, `hover`, `focus`, `disabled`; focus = 2px `focus` outline stroke OUTSIDE).
   Screens use instances only; never detach.
7. Work only in the files assigned to you. Do not touch `src/lib/` (if a helper is missing or buggy,
   write a small local helper in your file and report it). Do not change anything outside
   `design/figma/`. Do not commit, do not switch branches.

## Report
At the end: files written, the list of components (with variant properties) or screens made, the
final output of the test run, texts you could not find in the catalogs, and anything you were unsure
about.

## Lessons from running in real Figma
- A boolean and an instance-swap property cannot share a name. `boolProp` + `swapProp` on the same
  layer renames the boolean to "Show <layer>"; `setProps(inst, { "Icon left": true })` still works.
- `addComponentProperty(name, type, default, { preferredValues })`: options are an object.
- Never clone screens full of instances (hug sizes get lost); build them again.
- Figma does not run plugins or repaint while its window is in the background.
