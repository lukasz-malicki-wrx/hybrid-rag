"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useUiStore } from "@/stores/ui-store";

/** Mobile drawer behaviour: closes after navigation and moves focus into it when opened. */
export function useSidebarDrawer() {
  const open = useUiStore((s) => s.sidebarOpen);
  const close = useUiStore((s) => s.closeSidebar);
  const pathname = usePathname();
  const focusTarget = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    close();
  }, [pathname, close]);
  useEffect(() => {
    if (open) focusTarget.current?.focus();
  }, [open]);

  return { open, close, focusTarget };
}
