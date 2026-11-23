import type { ComponentType } from "react";
import { Card } from "@hybrid-rag/ui/card";
import { cn } from "@hybrid-rag/ui/cn";
import { ArrowRightIcon, type IconProps } from "@hybrid-rag/ui/icons";
import { Text } from "@hybrid-rag/ui/text";

export type FlowStep = { id: string; title: string; text: string; stepLabel: string; Icon: ComponentType<IconProps> };

/** One class per column count: Tailwind only generates classes it can read in the source. */
const COLUMNS: Record<number, string> = { 4: "lg:grid-cols-4", 6: "lg:grid-cols-6" };

/**
 * A flow as boxes joined by arrows: one under the other on a phone, side by side on a wide screen.
 * It is an ordered list, so it reads as text in order; the arrows are decoration. Borders, not
 * colours, draw the boxes, so forced-colors mode keeps them.
 */
export function FlowDiagram({ label, steps }: { label: string; steps: readonly FlowStep[] }) {
  return (
    <figure className="m-0">
      <Text as="figcaption" size="sm" tone="muted" className="mb-4 font-semibold">
        {label}
      </Text>
      <ol className={cn("grid grid-cols-1 gap-9 lg:gap-5", COLUMNS[steps.length])}>
        {steps.map(({ id, title, text, stepLabel, Icon }, index) => (
          <Card as="li" key={id} className="relative flex flex-col gap-2 p-4">
            <span className="flex items-center justify-between text-muted">
              <Icon width={22} height={22} />
              <Text as="span" size="xs" className="font-semibold tabular-nums">
                <span className="sr-only">{stepLabel}</span>
                <span aria-hidden="true">{index + 1}</span>
              </Text>
            </span>
            <Text as="span" className="font-semibold">
              {title}
            </Text>
            <Text as="span" size="sm" tone="muted">
              {text}
            </Text>
            {index < steps.length - 1 ? (
              <ArrowRightIcon
                width={20}
                height={20}
                className="absolute -bottom-[1.625rem] left-1/2 -translate-x-1/2 rotate-90 text-muted lg:-right-[1.375rem] lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 lg:rotate-0"
              />
            ) : null}
          </Card>
        ))}
      </ol>
    </figure>
  );
}
