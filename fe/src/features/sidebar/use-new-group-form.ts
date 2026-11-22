"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Open/closed state of the new group form; focus returns to the "+" button on close. */
export function useNewGroupForm() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (!open && restoreFocus.current) {
      restoreFocus.current = false;
      toggleRef.current?.focus();
    }
  }, [open]);

  const show = useCallback(() => setOpen(true), []);
  const close = useCallback(() => {
    restoreFocus.current = true;
    setOpen(false);
  }, []);

  return { open, show, close, toggleRef };
}
