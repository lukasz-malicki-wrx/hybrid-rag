"use client";

import { SkipLink as SharedSkipLink } from "@hybrid-rag/ui/skip-link";
import { useTranslation } from "@/i18n/use-translation";

export function SkipLink() {
  const { t } = useTranslation();
  return <SharedSkipLink label={t("app.skipToContent")} />;
}
