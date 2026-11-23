import { memo } from "react";
import { cn } from "../lib/cn";
import { MoonIcon, SunIcon } from "../icons";

/**
 * A pill that flips between light and dark (moon first, sun second, the accent thumb on the
 * current one). Vertical (32x56) is the app's rail; horizontal (56x32) fits a header bar.
 * Presentation only: the app or site keeps the state and passes `dark`, the accessible `label`
 * (the action, e.g. "Switch to light theme") and `onToggle`.
 */
export const ThemePill = memo(function ThemePill({
  dark,
  label,
  onToggle,
  orientation = "vertical",
}: {
  dark: boolean;
  label: string;
  onToggle: () => void;
  orientation?: "vertical" | "horizontal";
}) {
  const vertical = orientation === "vertical";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onToggle}
      data-orientation={orientation}
      className={cn(
        "relative flex shrink-0 cursor-pointer items-center justify-between rounded-full border border-border bg-surface p-0.5 text-muted hover:bg-surface-2",
        vertical ? "h-14 w-8 flex-col" : "h-8 w-14 flex-row",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0.5 top-0.5 size-6 rounded-full bg-accent motion-safe:transition-transform forced-colors:bg-[Highlight]",
          !dark && (vertical ? "translate-y-[28px]" : "translate-x-[28px]"),
        )}
      />
      <span
        className={cn(
          "relative flex size-6 items-center justify-center",
          dark && "text-accent-fg forced-colors:text-[HighlightText]",
        )}
      >
        <MoonIcon width={14} height={14} />
      </span>
      <span
        className={cn(
          "relative flex size-6 items-center justify-center",
          !dark && "text-accent-fg forced-colors:text-[HighlightText]",
        )}
      >
        <SunIcon width={14} height={14} />
      </span>
    </button>
  );
});
