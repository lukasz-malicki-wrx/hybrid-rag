import { memo, type InputHTMLAttributes, type ReactNode } from "react";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  description?: ReactNode;
};

/** Checkbox with a large click target: the whole row is the label. */
export const Checkbox = memo(function Checkbox({ label, description, ...props }: CheckboxProps) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm hover:bg-surface-2">
      <input type="checkbox" className="size-4 accent-[var(--accent)]" {...props} />
      <span className="min-w-0 flex-1">
        <span className="block truncate">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
    </label>
  );
});
