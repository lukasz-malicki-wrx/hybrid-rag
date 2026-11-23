"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { notify } from "@/stores/toast-store";

const COPIED_MS = 2000;

/** Copies text to the clipboard; `copied` stays true briefly after success, failure shows a toast. */
export function useCopyText() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      notify.warn("chat.copyFailed");
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  }, []);
  return { copied, copy };
}
