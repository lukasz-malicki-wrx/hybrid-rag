import { memo, useId, type ReactNode, type Ref, type TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";
import { FIELD_LABEL } from "./field";

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hideLabel?: boolean;
  hint?: ReactNode;
  /** Shown under the field, e.g. a character counter; announced with the field. */
  footer?: ReactNode;
  ref?: Ref<HTMLTextAreaElement>;
};

export const TextArea = memo(function TextArea({ label, hideLabel, hint, footer, className, ...props }: TextAreaProps) {
  const id = useId();
  const hintId = useId();
  const footerId = useId();
  const describedBy = [hint && hintId, footer && footerId, props["aria-describedby"]].filter(Boolean).join(" ");
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={hideLabel ? "sr-only" : FIELD_LABEL}>
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      <textarea
        id={id}
        {...props}
        aria-describedby={describedBy || undefined}
        className={cn("block w-full resize-y rounded-lg border border-border bg-bg px-3 py-2 text-base placeholder:text-muted md:text-sm", className)}
      />
      {footer && (
        <p id={footerId} className="text-right text-xs text-muted">
          {footer}
        </p>
      )}
    </div>
  );
});
