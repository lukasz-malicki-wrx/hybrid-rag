import type { ReactNode } from "react";

/**
 * The scrolling list of a section. Its bottom edge fades out into the background; the fade is
 * decoration only and never catches the pointer.
 */
export function ScrollList({ children }: { children: ReactNode }) {
  return (
    <div className="relative -mx-2 min-h-0 flex-1">
      <div className="h-full overflow-y-auto px-2 pb-10">{children}</div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-bg to-transparent" />
    </div>
  );
}
