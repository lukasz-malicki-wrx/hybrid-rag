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
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) focusTarget.current?.focus();
    else if (wasOpen.current) {
      // Closed again: the focus was inside the drawer, which is hidden now, so it goes back to
      // the button that opened it instead of being lost.
      const active = document.activeElement;
      if (!active || active === document.body || active.closest("#sidebar")) {
        document.querySelector<HTMLElement>('[aria-controls="sidebar"]')?.focus();
      }
    }
    wasOpen.current = open;
  }, [open]);

  return { open, close, focusTarget };
}
