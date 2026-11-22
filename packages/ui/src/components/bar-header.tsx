import { memo, type ReactNode } from "react";
import { cn } from "../lib/cn";

export type BarHeaderProps = {
  /** The heading (a Heading, so the caller picks its level, id and ref). */
  children: ReactNode;
  /** A small line under the heading. Its space is always kept, so headings of different bars line up. */
  subtitle?: ReactNode;
  /** Buttons at the end of the bar. */
  actions?: ReactNode;
  className?: string;
};

/**
 * A bar pinned to the top of a pane: heading with a subtitle line on the left, actions on the
 * right. Bars that sit side by side (the conversation and its sources) are both this component,
 * so they share the height and the inner layout: their lines and headings meet.
 *
 * It is `sticky`, not `fixed`: it spans the width of its own scroll pane (a viewport-wide fixed bar
 * would cover the sidebar and the sources panel) and stays at the top while the pane scrolls.
 * The negative bottom margin takes it out of the layout, so the content scrolls underneath and is
 * blurred by the translucent background, as in iOS. Start the content below it with `pt-18`
 * (the bar's height) plus whatever spacing it needs.
 */
export const BarHeader = memo(function BarHeader({ children, subtitle, actions, className }: BarHeaderProps) {
  return (
    <div className={cn(
      "sticky top-0 z-10 -mb-18 flex h-18 w-full shrink-0 items-center gap-2 border-b border-border/60 bg-bg/10 px-4 backdrop-blur-xl backdrop-saturate-150",
      className,
    )}>
      <div className="min-w-0 flex-1">
        {children}
        <div className="h-4 truncate text-xs text-muted">{subtitle}</div>
      </div>
      {actions}
    </div>
  );
});
