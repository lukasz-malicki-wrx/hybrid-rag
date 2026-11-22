"use client";

import { useId, type ReactNode } from "react";
import { useModalDialog } from "@/hooks/use-modal-dialog";
import { cn } from "@/lib/cn";

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl";
};

const WIDTHS = { md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl" };

/**
 * Modal dialog on the native <dialog>: focus trap, Escape and focus return come from the
 * browser. Uses open:flex (not flex): a display class on a closed <dialog> would override its
 * display:none and leave it on the page, invisible but blocking clicks.
 */
export function Dialog({ open, onClose, title, description, children, footer, size = "md" }: DialogProps) {
  const ref = useModalDialog(open);
  const titleId = useId();
  const descriptionId = useId();
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={cn(
        "m-auto max-h-[85dvh] w-[calc(100%-2rem)] flex-col rounded-xl border border-border bg-bg p-0 text-fg shadow-xl open:flex",
        WIDTHS[size],
      )}
    >
      <div className="border-b border-border px-6 py-4">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        {description && (
          <div id={descriptionId} className="mt-1 space-y-2 text-sm text-muted">
            {description}
          </div>
        )}
      </div>
      {children && <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>}
      {footer && (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-6 py-4">{footer}</div>
      )}
    </dialog>
  );
}
