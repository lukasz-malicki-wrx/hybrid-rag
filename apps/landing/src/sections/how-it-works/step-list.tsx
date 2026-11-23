import type { ReactNode } from "react";
import { Heading } from "@hybrid-rag/ui/heading";
import { Text } from "@hybrid-rag/ui/text";

export type Step = { id: string; title: string; body: ReactNode };

/** Numbered steps joined by a line: a process told in order, each with a title and a paragraph. */
export function StepList({ steps }: { steps: readonly Step[] }) {
  return (
    <ol>
      {steps.map((step, index) => (
        <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
          {index < steps.length - 1 ? <span aria-hidden="true" className="absolute bottom-0 left-[1.1875rem] top-10 w-px bg-border" /> : null}
          <span
            aria-hidden="true"
            className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-sm font-semibold tabular-nums"
          >
            {index + 1}
          </span>
          <div className="min-w-0 pt-1.5">
            <Heading level={3} size="md">
              {step.title}
            </Heading>
            <Text className="mt-2">{step.body}</Text>
          </div>
        </li>
      ))}
    </ol>
  );
}
