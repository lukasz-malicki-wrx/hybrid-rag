import type { ReactNode } from "react";

export type PageProps = {
  /** The bar above the panel: a `BarHeader`. */
  header?: ReactNode;
  /** Stuck to the bottom of the panel while the content scrolls, e.g. the message box. It brings its own side gutters. */
  footer?: ReactNode;
  /**
   * A side panel (the sources of an answer), rendered only when given. From `xl` it stands next to
   * the page at full height, so its own `BarHeader` lines up with `header`. Below `xl` it covers
   * the page from the right. It brings its own surface, usually a `BarHeader` and a rounded panel.
   */
  aside?: ReactNode;
  children: ReactNode;
};

/**
 * The frame every view of the app is put in: the bar, then a rounded `panel` that scrolls on its
 * own, with an optional footer and side panel. The window, rail and column around it are
 * `AppShell`'s; the panel is inset 16px from the right and bottom edge (and from the column on
 * phones, where there is none).
 *
 * The scroll area is inside the panel, so the footer needs no `sticky` and the rounded corners
 * clip the content.
 */
export function Page({ header, footer, aside, children }: PageProps) {
  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        {header}
        <div className="mx-4 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-panel lg:ml-0">
          {/* `relative`: visually hidden text stays in this area instead of stretching the page. */}
          <div className="relative min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer && <div className="shrink-0 pb-4 pt-2">{footer}</div>}
        </div>
      </div>
      {aside && (
        <div className="fixed inset-y-0 right-0 z-30 flex w-full max-w-md flex-col bg-bg shadow-2xl xl:static xl:z-auto xl:w-96 xl:max-w-none xl:shrink-0 xl:bg-transparent xl:pr-4 xl:shadow-none">
          {aside}
        </div>
      )}
    </div>
  );
}
