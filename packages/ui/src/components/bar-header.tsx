import { memo, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { Text } from "./text";

export type BarHeaderProps = {
  /** The heading (a Heading, so the caller picks its level, id and ref). */
  children: ReactNode;
  /**
   * A small line under the heading. Bars that stand side by side (the page and its side panel)
   * must either both have one or both not: with one the title sits above the middle of the bar,
   * without it the title is centred.
   */
  subtitle?: ReactNode;
  /** Buttons at the end of the bar. */
  actions?: ReactNode;
  className?: string;
};

/**
 * The 64px bar at the top of a pane: heading (with an optional subtitle line) on the left,
 * actions on the right. Bars that sit side by side are all this component, so they share the
 * height, and their headings line up when they agree on having a subtitle (see `subtitle`).
 *
 * It is an ordinary block above the content, not an overlay: the content below it scrolls on its
 * own, so nothing needs to be padded to clear it. The subtitle line is a fixed 16px, so a link
 * with an icon in it does not move the heading. Without a subtitle there is no such line, which
 * keeps a one-line title vertically centred.
 */
export const BarHeader = memo(function BarHeader({ children, subtitle, actions, className }: BarHeaderProps) {
  return (
    <div className={cn("flex h-16 w-full shrink-0 items-center gap-2 px-4", className)}>
      <div className="min-w-0 flex-1">
        {children}
        {subtitle && (
          <Text tone="muted" size="xs" className="h-4 truncate">
            {subtitle}
          </Text>
        )}
      </div>
      {actions}
    </div>
  );
});
