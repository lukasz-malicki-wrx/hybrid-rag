"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useUiStore, type Section } from "@/stores/ui-store";
import { isSearchLabPath, sectionForPath } from "./section-for-path";

export type RailItemId = Section | "search";

/**
 * Which rail item is active. The section follows the route; clicking a rail button overrides it
 * until the next navigation. On the search lab the "Search lab" item is active, not a section,
 * unless a section was picked there. Both the section and the pick live in the ui store, so
 * there is one place to reset when the route changes.
 */
export function useRouteSection() {
  const pathname = usePathname();
  const section = useUiStore((s) => s.section);
  const pickedOn = useUiStore((s) => s.pickedOn);
  const pickSection = useUiStore((s) => s.pickSection);
  const followRoute = useUiStore((s) => s.followRoute);

  useEffect(() => {
    followRoute(pathname, sectionForPath(pathname));
  }, [pathname, followRoute]);

  const pick = useCallback((next: Section) => pickSection(next, pathname), [pickSection, pathname]);

  // `pickedOn === pathname` also guards the render before the effect above has cleared a pick.
  const active: RailItemId = isSearchLabPath(pathname) && pickedOn !== pathname ? "search" : section;
  return { section, active, pick };
}
