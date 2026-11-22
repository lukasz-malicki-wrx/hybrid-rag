import { memo } from "react";
import { SpinnerIcon } from "@/components/icons";

/** Loading indicator with its text (shown, or for screen readers only). */
export const Spinner = memo(function Spinner({ label, hideLabel }: { label: string; hideLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted">
      <SpinnerIcon />
      <span className={hideLabel ? "sr-only" : undefined}>{label}</span>
    </span>
  );
});
