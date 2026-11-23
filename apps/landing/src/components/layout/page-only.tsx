"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { pageIdFromPath } from "@/lib/routes";

/**
 * Shows its children on the pages of the site and not on a 404 (a path that is no page). The
 * layout cannot tell the two apart; the path can.
 */
export function PageOnly({ children }: { children: ReactNode }) {
  return pageIdFromPath(usePathname()) ? children : null;
}
