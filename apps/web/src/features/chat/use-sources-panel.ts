"use client";

import { useCallback, useState } from "react";
import type { Source } from "@/api/types";

/** The sources of one answer, the numbers it cites, and the citation to highlight. */
export type SourcesSelection = { sources: Source[]; cited: number[]; n: number };
export type OpenSources = (sources: Source[], cited: number[], n: number) => void;

export function useSourcesPanel() {
  const [selection, setSelection] = useState<SourcesSelection | null>(null);
  const open = useCallback<OpenSources>((sources, cited, n) => setSelection({ sources, cited, n }), []);
  const close = useCallback(() => setSelection(null), []);
  return { selection, open, close };
}
