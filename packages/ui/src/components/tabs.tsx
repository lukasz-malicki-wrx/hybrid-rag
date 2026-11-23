"use client";

import { memo, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../lib/cn";

export type TabItem<T extends string> = {
  value: T;
  label: ReactNode;
  /** A small number after the label, e.g. how many favourites there are. */
  count?: number;
};

export type TabsProps<T extends string> = {
  /** Accessible name of the tab list. */
  label: string;
  tabs: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** `id` of the panel the selected tab controls (the panel should have `role="tabpanel"`). */
  panelId?: string;
  className?: string;
};

/** The index to move to for a key of the tab list, or null when the key is not for navigation. */
export function nextTabIndex(key: string, index: number, count: number): number | null {
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return (index + 1) % count;
    case "ArrowLeft":
    case "ArrowUp":
      return (index - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

/**
 * Tabs that switch a list in place (WAI-ARIA tabs, automatic activation): arrows, Home and End
 * move the selection; only the selected tab is in the tab order. The selected tab is `bg` on a
 * `surface-2` track, as in the design.
 */
function TabsImpl<T extends string>({ label, tabs, value, onChange, panelId, className }: TabsProps<T>) {
  const base = useId();
  const list = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = tabs.findIndex((tab) => tab.value === value);
    const next = nextTabIndex(event.key, index, tabs.length);
    if (next === null) return;
    event.preventDefault();
    onChange(tabs[next].value);
    list.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <div
      ref={list}
      role="tablist"
      aria-label={label}
      className={cn("flex h-12 items-center gap-1 rounded-lg border border-border bg-surface-2 p-1", className)}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            id={`${base}-${tab.value}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={selected ? panelId : undefined}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.value)}
            onKeyDown={onKeyDown}
            className={cn(
              "inline-flex h-10 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-2 text-xs font-semibold uppercase",
              selected ? "bg-bg text-accent shadow-sm" : "text-muted hover:text-fg",
            )}
          >
            <span className="truncate">{tab.label}</span>
            {tab.count !== undefined && (
              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs font-medium text-fg">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export const Tabs = memo(TabsImpl) as typeof TabsImpl;
