import { memo } from "react";

/** The line with a day ("Today") between turns of different days. Sits inside its turn's `li`. */
export const DaySeparator = memo(function DaySeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted">
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
      <span>{label}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  );
});
