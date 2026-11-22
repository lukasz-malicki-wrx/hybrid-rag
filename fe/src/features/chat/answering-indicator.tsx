"use client";

import { memo } from "react";
import { SparklesIcon } from "@/components/icons";
import { useTranslation } from "@/i18n/use-translation";

/** Icon shown instead of the usual one while the assistant answers in a conversation. */
export const AnsweringIndicator = memo(function AnsweringIndicator() {
  const { t } = useTranslation();
  return (
    <>
      <SparklesIcon className="text-ai motion-safe:animate-pulse" />
      <span className="sr-only">{t("sidebar.answering")}</span>
    </>
  );
});
