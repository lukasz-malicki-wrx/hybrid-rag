import { memo, useId, type SelectHTMLAttributes } from "react";
import { cn } from "../lib/cn";
import { Field } from "./field";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  /** The label is read aloud but not shown (the control is named by what is around it). */
  hideLabel?: boolean;
};

export const Select = memo(function Select({ label, hideLabel, className, children, ...props }: SelectProps) {
  const id = useId();
  return (
    <Field label={label} hideLabel={hideLabel} htmlFor={id}>
      <select
        id={id}
        {...props}
        className={cn("block min-h-10 min-w-0 rounded-lg border border-border bg-bg px-3 py-1.5 text-base md:text-sm", className)}
      >
        {children}
      </select>
    </Field>
  );
});
