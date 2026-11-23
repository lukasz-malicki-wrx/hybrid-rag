import type { ReactNode } from "react";

/** One label style and one label-to-control gap (6px) for every field of the app. */
export const FIELD_LABEL = "block text-sm font-medium";

/**
 * A label above its control. A hidden label has no layout (it is still read aloud), so the
 * control then stands alone, e.g. inside a flex row.
 */
export function Field({ label, hideLabel, htmlFor, children }: { label: string; hideLabel?: boolean; htmlFor: string; children: ReactNode }) {
  if (hideLabel) {
    return (
      <>
        <label htmlFor={htmlFor} className="sr-only">
          {label}
        </label>
        {children}
      </>
    );
  }
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className={FIELD_LABEL}>
        {label}
      </label>
      {children}
    </div>
  );
}
