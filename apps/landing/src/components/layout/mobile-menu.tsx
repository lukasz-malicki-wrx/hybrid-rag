"use client";

import { useRef, type ReactNode } from "react";
import { buttonClass } from "@hybrid-rag/ui/button";
import { CloseIcon, MenuIcon } from "@hybrid-rag/ui/icons";
import { useDetailsDismiss } from "./use-details-dismiss";

/**
 * The menu below the desktop breakpoint: a native <details>, so it opens and closes without
 * JavaScript, behind a 40x40 button. `label` is the button's accessible name.
 */
export function MobileMenu({ label, children }: { label: string; children: ReactNode }) {
  const details = useRef<HTMLDetailsElement>(null);
  useDetailsDismiss(details);

  return (
    <details ref={details} className="group">
      <summary
        aria-label={label}
        className={buttonClass({ variant: "secondary", size: "icon", className: "list-none [&::-webkit-details-marker]:hidden" })}
      >
        <MenuIcon className="group-open:hidden" />
        <CloseIcon className="hidden group-open:block" />
      </summary>
      <div className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-border bg-bg px-gutter pb-6 pt-2 shadow-header">
        {children}
      </div>
    </details>
  );
}
