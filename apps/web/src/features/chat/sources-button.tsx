"use client";

import { memo, useCallback } from "react";
import { Button } from "@hybrid-rag/ui/button";
import type { Source } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";
import type { OpenSources } from "./use-sources-panel";

/** "2 cited sources" (or "6 excerpts searched" when the answer cites nothing); opens the panel. */
export const SourcesButton = memo(function SourcesButton({
  sources,
  cited,
  onOpen,
}: {
  sources: Source[];
  cited: number[];
  onOpen: OpenSources;
}) {
  const { tp } = useTranslation();
  const open = useCallback(() => onOpen(sources, cited, cited[0] ?? 1), [onOpen, sources, cited]);
  if (!sources.length) return null;
  return (
    <Button variant="chip" size="xs" onClick={open}>
      {cited.length ? tp("counts.citedSources", cited.length) : tp("counts.searchedExcerpts", sources.length)}
    </Button>
  );
});
