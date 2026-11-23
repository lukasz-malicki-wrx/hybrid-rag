"use client";

import Link from "next/link";
import { memo, type ReactNode } from "react";
import { cn } from "@hybrid-rag/ui/cn";

const TILE =
  "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors";
const IDLE = "bg-surface text-muted hover:bg-surface-2 hover:text-fg";
// Soft glow under the active tile, from the accent colour itself.
const ACTIVE = "bg-accent text-accent-fg shadow-[0_8px_16px_-4px_color-mix(in_srgb,var(--accent)_55%,transparent)]";

type Props = {
  /** Accessible name; also the tooltip. */
  label: string;
  icon: ReactNode;
  active: boolean;
} & ({ href: string; onSelect?: undefined } | { href?: undefined; onSelect: () => void });

/**
 * One item of the icon rail: a 32px tile, with a marker at the window edge when it is the active
 * one. A link when it goes to a page (`href`), a button when it only switches the column.
 */
export const RailItem = memo(function RailItem({ label, icon, active, href, onSelect }: Props) {
  const className = cn(TILE, active ? ACTIVE : IDLE);
  return (
    <div className="relative flex w-full justify-center">
      {active && (
        <span aria-hidden="true" className="absolute left-0 top-1/2 h-[47px] w-1.5 -translate-y-1/2 rounded-r-full bg-accent" />
      )}
      {href ? (
        <Link href={href} aria-label={label} title={label} aria-current={active ? "page" : undefined} className={className}>
          {icon}
        </Link>
      ) : (
        <button type="button" aria-label={label} title={label} aria-pressed={active} onClick={onSelect} className={className}>
          {icon}
        </button>
      )}
    </div>
  );
});
