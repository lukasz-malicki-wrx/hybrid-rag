"use client";

import { memo, useMemo } from "react";
import { RadioGroup, type RadioOption } from "@hybrid-rag/ui/radio-group";
import type { SearchMode } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";

export const SearchModeSelect = memo(function SearchModeSelect({
  value,
  onChange,
}: {
  value: SearchMode;
  onChange: (value: SearchMode) => void;
}) {
  const { t } = useTranslation();
  const options = useMemo<RadioOption<SearchMode>[]>(
    () => [
      { value: "hybrid", label: t("searchLab.modeHybrid") },
      { value: "vector", label: t("searchLab.modeVector") },
      { value: "fulltext", label: t("searchLab.modeFulltext") },
    ],
    [t],
  );
  return <RadioGroup legend={t("searchLab.mode")} name="search-mode" options={options} value={value} onChange={onChange} />;
});
