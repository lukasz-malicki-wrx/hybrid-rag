"use client";

import { memo } from "react";
import type { Source } from "@/api/types";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/use-translation";

/** A citation as a superscript number; hover shows the file and page, click opens the source. */
export const CitationButton = memo(function CitationButton({
  source,
  onOpen,
}: {
  source: Source;
  onOpen: (n: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <sup className="ml-0.5 leading-none">
      <Button
        variant="link"
        size="inline"
        onClick={() => onOpen(source.n)}
        title={t("answer.sourceTitle", { filename: source.filename, page: source.page })}
        aria-label={t("answer.source", { n: source.n, filename: source.filename, page: source.page })}
        className="font-semibold hover:bg-surface-2"
      >
        [{source.n}]
      </Button>
    </sup>
  );
});
