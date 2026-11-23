"use client";

import { memo } from "react";
import { useTranslation } from "@/i18n/use-translation";

export const DropOverlay = memo(function DropOverlay() {
  const { t } = useTranslation();
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-surface/90 text-sm font-medium">
      {t("composer.dropHere")}
    </div>
  );
});
