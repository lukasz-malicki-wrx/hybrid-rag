"use client";

import { memo } from "react";
import { Heading } from "@hybrid-rag/ui/heading";
import { Spinner } from "@hybrid-rag/ui/spinner";
import { Text } from "@hybrid-rag/ui/text";
import type { SearchHit } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";
import { SearchHitCard } from "./search-hit-card";

export const SearchResults = memo(function SearchResults({
  hits,
  pending,
}: {
  hits: SearchHit[] | undefined;
  pending: boolean;
}) {
  const { t, tp } = useTranslation();
  if (pending) return <Spinner label={t("searchLab.searching")} />;
  if (!hits) return <Text tone="muted">{t("searchLab.idle")}</Text>;
  if (hits.length === 0) return <Text role="status">{t("searchLab.nothing")}</Text>;
  return (
    <section aria-labelledby="search-results" className="space-y-3">
      <Heading id="search-results">{tp("counts.results", hits.length)}</Heading>
      <Text tone="muted" size="sm">
        {t("searchLab.scoreNote")}
      </Text>
      <ol className="space-y-3">
        {hits.map((hit, i) => (
          <SearchHitCard key={hit.id} hit={hit} position={i + 1} />
        ))}
      </ol>
    </section>
  );
});
