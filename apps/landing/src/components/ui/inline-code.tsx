import type { ReactNode } from "react";

/** A short piece of code inside a sentence: a setting, a file name, an address. */
export function InlineCode({ children }: { children: ReactNode }) {
  return <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.9em] [overflow-wrap:anywhere]">{children}</code>;
}

/** For `t.rich`: `<code>…</code>` in a text becomes an `InlineCode`. */
export const codeTag = { code: (content: ReactNode) => <InlineCode>{content}</InlineCode> };
