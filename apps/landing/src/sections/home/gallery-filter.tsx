"use client";

import { Fragment, useId, useRef, useState, useSyncExternalStore, type ChangeEvent, type ReactNode } from "react";
import { Select } from "@hybrid-rag/ui/select";
import { Tabs } from "@hybrid-rag/ui/tabs";
import type { GalleryArea, GalleryCardArea } from "./gallery-data";

type GalleryFilterProps = {
  /** The accessible name of the tab list and of the select. */
  label: string;
  tabs: readonly { value: GalleryArea; label: string }[];
  /** The cards, already rendered on the server; this component only chooses which are shown. */
  cards: readonly { id: string; area: GalleryCardArea; node: ReactNode }[];
};

/** Where the tabs give way to a select: five tabs do not fit a phone (Tailwind's `sm`). */
const TABS_QUERY = "(min-width: 40rem)";

const subscribe = (notify: () => void) => {
  const query = window.matchMedia(TABS_QUERY);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

/**
 * Tabs that filter the gallery, and below `sm` the same filter as a select (the tabs would be cut
 * off). Both are in the server HTML and CSS shows the one that fits, so nothing moves when the page
 * becomes interactive; the first value is "all", so without script every card is shown. The panel
 * is a tab panel only while the tabs are what the reader uses. It keeps the height it had with all
 * cards while a filter is on, so what follows it does not move.
 */
export function GalleryFilter({ label, tabs, cards }: GalleryFilterProps) {
  const [area, setArea] = useState<GalleryArea>("all");
  const tabsShown = useSyncExternalStore(subscribe, () => window.matchMedia(TABS_QUERY).matches, () => true);
  const panelId = useId();
  const panel = useRef<HTMLDivElement>(null);

  const select = (next: GalleryArea) => {
    const el = panel.current;
    if (el) {
      if (area === "all") el.style.minHeight = `${el.getBoundingClientRect().height}px`;
      if (next === "all") el.style.minHeight = "";
    }
    setArea(next);
  };

  const shown = cards.filter((card) => area === "all" || card.area === area);
  const current = tabs.find((tab) => tab.value === area)?.label;
  return (
    <>
      <Tabs label={label} tabs={tabs} value={area} onChange={select} panelId={panelId} className="mx-auto hidden max-w-215 sm:flex" />
      <div className="sm:hidden">
        <Select
          label={label}
          hideLabel
          value={area}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => select(event.target.value as GalleryArea)}
          className="w-full"
        >
          {tabs.map((tab) => (
            <option key={tab.value} value={tab.value}>
              {tab.label}
            </option>
          ))}
        </Select>
      </div>
      <div
        ref={panel}
        role={tabsShown ? "tabpanel" : "region"}
        id={panelId}
        aria-label={current}
        className="mt-heading"
      >
        <ul className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((card) => (
            <Fragment key={card.id}>{card.node}</Fragment>
          ))}
        </ul>
      </div>
    </>
  );
}
