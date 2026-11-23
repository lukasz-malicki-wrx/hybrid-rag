import { Card } from "@hybrid-rag/ui/card";
import { Heading } from "@hybrid-rag/ui/heading";
import { Text } from "@hybrid-rag/ui/text";
import type { Step } from "./step-list";

/** The same steps as cards in two columns: for a short sequence that should not run down the page. */
export function StepGrid({ steps }: { steps: readonly Step[] }) {
  return (
    <ol className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {steps.map((step, index) => (
        <Card as="li" key={step.id} className="p-6">
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-surface-2 text-sm font-semibold tabular-nums"
          >
            {index + 1}
          </span>
          <Heading level={3} size="md" className="mt-4">
            {step.title}
          </Heading>
          <Text className="mt-2">{step.body}</Text>
        </Card>
      ))}
    </ol>
  );
}
