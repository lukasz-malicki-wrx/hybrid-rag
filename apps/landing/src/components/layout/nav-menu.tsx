"use client";

import Link from "next/link";
import { useRef } from "react";
import { buttonClass } from "@hybrid-rag/ui/button";
import { ChevronDownIcon } from "@hybrid-rag/ui/icons";
import type { NavItem } from "./nav-links";
import { useDetailsDismiss } from "./use-details-dismiss";

/**
 * A header entry that opens a list of pages ("Product"): a native <details>, so it opens without
 * JavaScript; Escape, a click outside and following a link close it. The summary carries
 * aria-current when the current page is one of the list. The list hangs from the bottom of the
 * header (the nearest positioned ancestor), not from the button.
 */
export function NavMenu({ label, items, current }: { label: string; items: NavItem[]; current: string | undefined }) {
  const details = useRef<HTMLDetailsElement>(null);
  useDetailsDismiss(details);
  const inside = items.some((item) => item.id === current);

  return (
    <details ref={details} className="group">
      <summary
        aria-current={inside ? "true" : undefined}
        className={buttonClass({ variant: "quiet", size: "sm", className: "list-none [&::-webkit-details-marker]:hidden" })}
      >
        {label}
        <ChevronDownIcon width={16} height={16} className="motion-safe:transition-transform group-open:rotate-180" />
      </summary>
      <ul className="absolute top-full z-50 flex w-60 flex-col gap-1 rounded-lg border border-border bg-bg p-1 shadow-header">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              aria-current={item.id === current ? "page" : undefined}
              className={buttonClass({ variant: "quiet", size: "md", className: "w-full justify-start" })}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
