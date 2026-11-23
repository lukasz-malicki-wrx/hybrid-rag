import { createElement, Fragment, type ReactNode } from "react";
import { interpolate, type Params } from "./interpolate";

/** What a tag becomes: gets the already rendered content between the tags. */
export type RichTags = Record<string, (children: ReactNode) => ReactNode>;

type Part = { kind: "text"; text: string } | { kind: "tag"; name: string; children: Part[] };

const TAG = /<(\/?)([a-zA-Z][\w-]*)>/g;

/**
 * Parses `Read the <link>privacy page</link> or <b>ask</b>`. Tags nest; a tag that is never
 * closed, or a closing tag that was never opened, stays in the text as it is written.
 */
export function parseRich(text: string): Part[] {
  const root: Part[] = [];
  const stack: { name: string; children: Part[]; open: string }[] = [];
  const current = () => stack.at(-1)?.children ?? root;
  let last = 0;
  for (const match of text.matchAll(TAG)) {
    const [raw, closing, name = ""] = match;
    const index = match.index ?? 0;
    if (index > last) current().push({ kind: "text", text: text.slice(last, index) });
    last = index + raw.length;
    if (!closing) {
      stack.push({ name, children: [], open: raw });
    } else if (stack.at(-1)?.name === name) {
      const done = stack.pop();
      if (done) current().push({ kind: "tag", name, children: done.children });
    } else {
      current().push({ kind: "text", text: raw });
    }
  }
  if (last < text.length) current().push({ kind: "text", text: text.slice(last) });
  // Tags left open: put them back as text, with their content, in order.
  while (stack.length > 0) {
    const open = stack.pop();
    if (!open) break;
    current().push({ kind: "text", text: open.open }, ...open.children);
  }
  return root;
}

function render(parts: Part[], tags: RichTags, params: Params | undefined): ReactNode[] {
  return parts.map((part, index) => {
    if (part.kind === "text") return interpolate(part.text, params);
    const content = createElement(Fragment, null, ...render(part.children, tags, params));
    const make = tags[part.name];
    return createElement(Fragment, { key: index }, make ? make(content) : content);
  });
}

/** The React nodes of a message with tags. No HTML is ever parsed or injected: tags map to components. */
export function renderRich(text: string, tags: RichTags, params?: Params): ReactNode {
  return createElement(Fragment, null, ...render(parseRich(text), tags, params));
}

/** The names of the tags in a message, sorted, for checking that translations use the same ones. */
export function richTagNames(text: string): string[] {
  const names: string[] = [];
  const walk = (parts: Part[]) => {
    for (const part of parts) {
      if (part.kind === "tag") {
        names.push(part.name);
        walk(part.children);
      }
    }
  };
  walk(parseRich(text));
  return names.sort((a, b) => a.localeCompare(b));
}
