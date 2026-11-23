import type { CSSProperties, ReactNode } from "react";
import { cn } from "@hybrid-rag/ui/cn";
import { Text } from "@hybrid-rag/ui/text";

/** The divider before an item: on a phone before the right-hand one of a pair, on wide screens before all but the first. */
const DIVIDER =
  "before:absolute before:top-1/2 before:left-0 before:hidden before:h-10 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-band-muted/40 max-lg:even:before:block lg:not-first:before:block";

type Stat = { value: ReactNode; label: ReactNode };

/**
 * The dark band of numbers: each a figure over its description, with thin dividers between them
 * (two columns on a phone, one row on wide screens). A divider is a 2x40px stroke in the middle of the band's
 * height, not a border of the full height. A description list: the label is the term, the figure its value, so a
 * screen reader says "Questions: 44".
 */
export function StatBand({ stats, className }: { stats: readonly Stat[]; className?: string }) {
  return (
    <dl
      style={{ "--stat-cols": `repeat(${stats.length}, minmax(0, 1fr))` } as CSSProperties}
      className={cn("on-band grid grid-cols-2 overflow-hidden rounded-xl bg-band py-4 text-band-fg lg:grid-cols-(--stat-cols) lg:py-10", className)}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className={cn(
            "relative flex flex-col-reverse justify-end gap-2 px-4 py-6 text-center max-lg:nth-[n+3]:border-t max-lg:nth-[n+3]:border-band-muted/40 max-lg:last:odd:col-span-2",
            DIVIDER,
          )}
        >
          <Text as="dt" size="lead" tone="band-muted">
            {stat.label}
          </Text>
          <Text as="dd" size="stat" tone="band" className="m-0">
            {stat.value}
          </Text>
        </div>
      ))}
    </dl>
  );
}
