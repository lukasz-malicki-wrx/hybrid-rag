"use client";

import { usePathname } from "next/navigation";
import { useEffect, type RefObject } from "react";

/**
 * What a native <details> lacks when it is a menu: Escape closes it and returns focus to its
 * summary; a click or focus outside closes it; following a link in it closes it. Without
 * JavaScript it still opens and closes with its summary.
 */
export function useDetailsDismiss(details: RefObject<HTMLDetailsElement | null>) {
  const pathname = usePathname();

  // A link to the page that is already open does not change the path; the click handler below does.
  useEffect(() => {
    details.current?.removeAttribute("open");
  }, [details, pathname]);

  useEffect(() => {
    const element = details.current;
    if (!element) return;
    const close = (restoreFocus: boolean) => {
      if (!element.open) return;
      element.open = false;
      if (restoreFocus) element.querySelector("summary")?.focus();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const onFocusOut = (event: FocusEvent) => {
      if (event.relatedTarget instanceof Node && !element.contains(event.relatedTarget)) close(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !element.contains(event.target)) close(false);
    };
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a")) close(false);
    };
    element.addEventListener("keydown", onKeyDown);
    element.addEventListener("focusout", onFocusOut);
    element.addEventListener("click", onClick);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      element.removeEventListener("keydown", onKeyDown);
      element.removeEventListener("focusout", onFocusOut);
      element.removeEventListener("click", onClick);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [details]);
}
