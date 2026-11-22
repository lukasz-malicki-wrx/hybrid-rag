"use client";

import { Spinner } from "@/components/ui/spinner";
import type { MessageKey } from "@/i18n/messages";
import { useTranslation } from "@/i18n/use-translation";

export function PageLoading({ label = "app.loading" }: { label?: MessageKey }) {
  const { t } = useTranslation();
  return (
    <div className="p-6">
      <Spinner label={t(label)} />
    </div>
  );
}
