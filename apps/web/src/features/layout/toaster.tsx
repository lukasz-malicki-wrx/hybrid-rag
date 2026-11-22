"use client";

import { cn } from "@hybrid-rag/ui/cn";
import { ApiError } from "@/api/client";
import type { Translator } from "@/i18n/translate";
import { useTranslation } from "@/i18n/use-translation";
import { useToastStore, type Toast } from "@/stores/toast-store";

function toastText({ key, params, error }: Toast, t: Translator["t"]): string {
  if (key) return t(key, params);
  if (error instanceof ApiError) return error.message;
  return t("errors.network");
}

/** Renders notifications in a polite live region. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const { t } = useTranslation();

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end"
    >
      {toasts.map((toast) => (
        <p
          key={toast.id}
          className={cn(
            "pointer-events-auto max-w-sm rounded-lg border px-4 py-2 text-sm shadow-lg",
            toast.tone === "error" ? "border-danger bg-bg text-danger" : "border-border bg-surface-2 text-fg",
          )}
        >
          {toastText(toast, t)}
        </p>
      ))}
    </div>
  );
}
