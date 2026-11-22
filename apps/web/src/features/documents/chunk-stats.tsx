"use client";

import { memo, useMemo } from "react";
import type { Chunk } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";
import { SHORT_CHUNK_CHARS } from "./chunk-card";

export function summarize(chunks: Chunk[]) {
  const sizes = chunks.map((c) => c.chars);
  return {
    count: chunks.length,
    average: sizes.length ? Math.round(sizes.reduce((sum, n) => sum + n, 0) / sizes.length) : 0,
    shortest: sizes.length ? Math.min(...sizes) : 0,
    longest: sizes.length ? Math.max(...sizes) : 0,
    short: sizes.filter((n) => n < SHORT_CHUNK_CHARS).length,
  };
}

/** Size of the chunks at a glance: the numbers that show whether the cut is sensible. */
export const ChunkStats = memo(function ChunkStats({ chunks }: { chunks: Chunk[] }) {
  const { t } = useTranslation();
  const stats = useMemo(() => summarize(chunks), [chunks]);
  const items = [
    { label: t("documentView.statChunks"), value: stats.count },
    { label: t("documentView.statAverage"), value: stats.average },
    { label: t("documentView.statShortest"), value: stats.shortest },
    { label: t("documentView.statLongest"), value: stats.longest },
    { label: t("documentView.statShort", { chars: SHORT_CHUNK_CHARS }), value: stats.short },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border bg-surface px-3 py-2">
          <dt className="text-xs text-muted">{item.label}</dt>
          <dd className="text-lg font-semibold">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
});
