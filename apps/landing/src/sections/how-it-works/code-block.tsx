import { Text } from "@hybrid-rag/ui/text";

/**
 * A command to copy. The figure is named by its caption and can be focused, so a long line can be
 * scrolled with the keyboard (WCAG 2.1.1: a scrollable area has to be reachable). The text is
 * plain (no prompt sign), so a selection pastes into a terminal as it is.
 */
// An expression, not a literal: focus belongs on this non-interactive element (see above), which
// the a11y lint rules allow only that way.
const SCROLLABLE_FOCUS = 0;

export function CodeBlock({ label, command }: { label: string; command: string }) {
  return (
    <figure
      tabIndex={SCROLLABLE_FOCUS}
      className="m-0 overflow-x-auto rounded-lg border border-border bg-surface-2 px-4 py-3.5"
    >
      <Text as="figcaption" size="sm" tone="muted" className="mb-2 font-medium">
        {label}
      </Text>
      <pre className="w-max min-w-full text-[0.9375rem] leading-relaxed">
        <code>{command}</code>
      </pre>
    </figure>
  );
}
