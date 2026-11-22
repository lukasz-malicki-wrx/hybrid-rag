"use client";

import { memo } from "react";
import { Badge } from "@hybrid-rag/ui/badge";
import { AlertIcon } from "@hybrid-rag/ui/icons";
import { useTranslation } from "@/i18n/use-translation";

export const AnswerFlags = memo(function AnswerFlags({
  refused,
  uncited,
  stopped,
}: {
  refused?: boolean | null;
  uncited?: boolean | null;
  stopped?: boolean;
}) {
  const { t } = useTranslation();
  const warning = <AlertIcon width={14} height={14} />;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
      {refused && (
        <Badge tone="warn" icon={warning}>
          {t("answer.notFound")}
        </Badge>
      )}
      {uncited && (
        <Badge tone="warn" icon={warning}>
          {t("answer.noCitations")}
        </Badge>
      )}
      {stopped && <Badge>{t("answer.stopped")}</Badge>}
      <span className="text-muted">{t("answer.aiGenerated")}</span>
    </div>
  );
});
