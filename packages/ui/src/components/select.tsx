import { memo, useId, type SelectHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string };

export const Select = memo(function Select({ label, className, children, ...props }: SelectProps) {
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        {...props}
        className={cn("min-h-10 min-w-0 rounded-lg border border-border bg-bg px-3 py-1.5", className)}
      >
        {children}
      </select>
    </>
  );
});
