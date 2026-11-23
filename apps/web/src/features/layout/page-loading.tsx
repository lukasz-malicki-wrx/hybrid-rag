"use client";

import { Spinner } from "@hybrid-rag/ui/spinner";
import type { MessageKey } from "@/i18n/messages";
import { useTranslation } from "@/i18n/use-translation";
import { Page } from "./page";

/** A whole view while its data loads: an empty bar's height, then the panel with a spinner. */
export function PageLoading({ label = "app.loading" }: { label?: MessageKey }) {
  const { t } = useTranslation();
  return (
    <Page header={<div className="h-16 shrink-0" />}>
      <div className="p-6">
        <Spinner label={t(label)} />
      </div>
    </Page>
  );
}
