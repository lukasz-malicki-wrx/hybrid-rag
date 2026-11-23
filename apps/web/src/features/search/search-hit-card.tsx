"use client";

import Link from "next/link";
import { memo } from "react";
import { Badge } from "@hybrid-rag/ui/badge";
import type { SearchHit } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";

/** One ranked chunk with the evidence behind its position: where each method put it. */
export const SearchHitCard = memo(function SearchHitCard({ hit, position }: { hit: SearchHit; position: number }) {
  const { t } = useTranslation();
  const vector =
    hit.vector_rank === null
      ? t("searchLab.notInVector")
      : t("searchLab.vectorRank", { rank: hit.vector_rank, distance: (hit.distance ?? 0).toFixed(3) });
  const fulltext =
    hit.fulltext_rank === null ? t("searchLab.notInFulltext") : t("searchLab.fulltextRank", { rank: hit.fulltext_rank });
  return (
    <li className="rounded-lg bg-bubble-user p-3">
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="text-base font-semibold">{position}</span>
        <Link
          href={`/d/${hit.document_id}#chunk-${hit.id}`}
          className="font-semibold text-accent hover:underline"
          title={t("searchLab.showInDocument")}
        >
          {hit.filename}, {t("documentView.page", { page: hit.page })}
        </Link>
        <Badge>{t("searchLab.score", { score: hit.score.toFixed(4) })}</Badge>
        <Badge tone={hit.vector_rank === null ? "warn" : "neutral"}>{vector}</Badge>
        <Badge tone={hit.fulltext_rank === null ? "warn" : "neutral"}>{fulltext}</Badge>
      </div>
      <p className="font-sans text-sm break-words whitespace-pre-wrap">{hit.text}</p>
    </li>
  );
});
