"use client";

import { useTranslation } from "@/i18n/use-translation";

export function SkipLink() {
  const { t } = useTranslation();
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-md bg-accent px-3 py-2 text-accent-fg focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
    >
      {t("app.skipToContent")}
    </a>
  );
}
