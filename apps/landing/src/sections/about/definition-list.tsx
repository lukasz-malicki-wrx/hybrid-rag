import type { ReactNode } from "react";
import { Text } from "@hybrid-rag/ui/text";

type Definition = { id: string; term: string; detail: ReactNode };

/** A term and what it means, one per row; the term sits beside the text from the small breakpoint up. */
export function DefinitionList({ items }: { items: readonly Definition[] }) {
  return (
    <dl className="border-t border-border">
      {items.map(({ id, term, detail }) => (
        <div key={id} className="grid grid-cols-1 gap-1 border-b border-border py-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8">
          <Text as="dt" className="font-semibold">
            {term}
          </Text>
          <Text as="dd" tone="muted">
            {detail}
          </Text>
        </div>
      ))}
    </dl>
  );
}
