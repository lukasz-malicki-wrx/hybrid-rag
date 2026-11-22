"use client";

import { useEffect, useRef } from "react";

/**
 * Keeps a native <dialog> in sync with `open`: showModal() gives focus trapping, Escape and
 * focus return for free.
 */
export function useModalDialog(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return ref;
}
