import type { ReactNode } from "react";
import { cn } from "@hybrid-rag/ui/cn";
import { Heading } from "@hybrid-rag/ui/heading";
import { Text } from "@hybrid-rag/ui/text";
import { ContourPattern } from "./contour-pattern";

type CtaBandProps = {
  /** The id of the title: it names the band for assistive technology. */
  id: string;
  title: ReactNode;
  text?: ReactNode;
  /** A command to copy, set in a dark box. */
  command?: ReactNode;
  /** The buttons and links: full width on a phone, on the right and centred vertically on wide screens. They sit on the accent colour: use the `band` button variant. */
  children: ReactNode;
  className?: string;
};

/** The call to action: a band in the accent colour with contour lines, a title, a sentence, a command and the buttons. */
export function CtaBand({ id, title, text, command, children, className }: CtaBandProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn("on-accent relative overflow-hidden rounded-xl bg-accent text-accent-fg", className)}
    >
      <ContourPattern />
      <div className="relative grid grid-cols-1 gap-8 px-6 py-10 md:px-12 md:py-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16">
        <div className="flex flex-col gap-4">
          <Heading id={id} level={2} size="h2">
            {title}
          </Heading>
          {text ? (
            <Text size="lead" tone="accent-fg" className="max-w-copy">
              {text}
            </Text>
          ) : null}
          {command ? (
            <Text as="div" size="xs" tone="band" className="max-w-fit rounded-lg bg-band px-3 py-3 font-mono sm:px-4 sm:text-sm">
              <code>{command}</code>
            </Text>
          ) : null}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-start">{children}</div>
      </div>
    </section>
  );
}
