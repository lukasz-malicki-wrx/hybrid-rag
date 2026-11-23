import type { ReactNode } from "react";
import { Heading } from "@hybrid-rag/ui/heading";

/**
 * One of the three columns of the start screen: an icon and a title over a stack of tiles.
 * `bubble-user` makes the card stand out from the panel in both themes; the tiles inside use
 * `bubble-ai`, so each level differs from the one below it.
 */
export function StartCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg bg-bubble-user p-4">
      <Heading level={3} size="caption" className="mb-4 flex items-center justify-center gap-2">
        {icon}
        {title}
      </Heading>
      {children}
    </section>
  );
}

export const TILE = "flex min-h-12 w-full items-center justify-center rounded-lg bg-bubble-ai px-3 py-2 text-center text-xs";
