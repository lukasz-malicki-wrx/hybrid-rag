"use client";

import { useEffect, useRef } from "react";

/** Returns a ref to put after the last item; it is scrolled into view whenever `deps` change. */
export function useScrollToEnd(deps: readonly unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "end" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the caller decides what triggers it
  }, deps);
  return ref;
}
