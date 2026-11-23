"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClass } from "@hybrid-rag/ui/button";
import { cn } from "@hybrid-rag/ui/cn";
import { Text } from "@hybrid-rag/ui/text";
import { pageIdFromPath, type PageId } from "@/lib/routes";
import { NavMenu } from "./nav-menu";

export type NavItem = { id: PageId; href: string; label: string };
export type NavEntryView = ({ kind: "page" } & NavItem) | { kind: "menu"; id: string; label: string; items: NavItem[] };

function PageLink({ item, current, column }: { item: NavItem; current: string | undefined; column: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={item.id === current ? "page" : undefined}
      className={buttonClass({ variant: "quiet", size: column ? "md" : "sm", className: cn(column && "w-full justify-start") })}
    >
      {item.label}
    </Link>
  );
}

/**
 * The page links of the header. The current page is marked with aria-current (and underlined). In a
 * row (desktop) a menu is a dropdown; in a column (the phone's panel) its pages are listed under its name.
 */
export function NavLinks({ entries, direction }: { entries: NavEntryView[]; direction: "row" | "column" }) {
  const current = pageIdFromPath(usePathname())?.id;
  const column = direction === "column";
  return (
    <ul className={cn("flex gap-1", column ? "flex-col" : "items-center")}>
      {entries.map((entry) => {
        if (entry.kind === "page") {
          return (
            <li key={entry.id}>
              <PageLink item={entry} current={current} column={column} />
            </li>
          );
        }
        if (!column) {
          return (
            <li key={entry.id}>
              <NavMenu label={entry.label} items={entry.items} current={current} />
            </li>
          );
        }
        return (
          <li key={entry.id}>
            <Text as="div" size="xs" tone="muted" className="px-4 pb-1 pt-3 font-semibold uppercase tracking-wide">
              {entry.label}
            </Text>
            <ul className="flex flex-col gap-1">
              {entry.items.map((item) => (
                <li key={item.id}>
                  <PageLink item={item} current={current} column />
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
