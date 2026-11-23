import type { ReactNode } from "react";
import { PlusIcon } from "@hybrid-rag/ui/icons";

type FaqEntry = { id: string; question: string; answer: ReactNode };

/**
 * Questions as native <details>: they open with Enter or Space, without JavaScript, and the browser's
 * find-in-page opens the one that matches. The plus turns into a cross when open.
 */
export function FaqList({ items }: { items: readonly FaqEntry[] }) {
  return (
    <div className="border-t border-border">
      {items.map(({ id, question, answer }) => (
        <details key={id} className="group border-b border-border">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-4 font-medium marker:hidden [&::-webkit-details-marker]:hidden">
            <span>{question}</span>
            <PlusIcon className="shrink-0 text-muted transition-transform group-open:rotate-45 motion-reduce:transition-none" />
          </summary>
          <div className="max-w-copy pb-6 leading-relaxed text-pretty">{answer}</div>
        </details>
      ))}
    </div>
  );
}
