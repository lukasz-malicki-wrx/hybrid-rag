"use client";

import { memo } from "react";
import { Badge } from "@hybrid-rag/ui/badge";
import { Highlighted } from "@hybrid-rag/ui/highlighted";
import type { Chunk } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";

/** Chunks shorter than this rarely carry enough context to be found or understood alone. */
export const SHORT_CHUNK_CHARS = 200;

/** One chunk exactly as it is stored and searched; its anchor lets search results link here. */
export const ChunkCard = memo(function ChunkCard({ chunk, highlight = "" }: { chunk: Chunk; highlight?: string }) {
  const { t, tp } = useTranslation();
  return (
    <li
      id={`chunk-${chunk.id}`}
      className="scroll-mt-4 rounded-lg border border-border bg-surface p-3 target:ring-2 target:ring-accent"
    >
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span className="font-semibold text-fg">{t("documentView.page", { page: chunk.page })}</span>
        <span>{t("documentView.position", { position: chunk.position + 1 })}</span>
        <span>{tp("counts.characters", chunk.chars)}</span>
        {chunk.chars < SHORT_CHUNK_CHARS && <Badge tone="warn">{t("documentView.short")}</Badge>}
      </div>
      <p className="font-sans text-sm break-words whitespace-pre-wrap">
        <Highlighted text={chunk.text} needle={highlight} />
      </p>
    </li>
  );
});
