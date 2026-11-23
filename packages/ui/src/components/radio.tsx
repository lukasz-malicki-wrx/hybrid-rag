import { memo, type InputHTMLAttributes, type ReactNode } from "react";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode };

export const Radio = memo(function Radio({ label, ...props }: RadioProps) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm hover:bg-surface-2">
      <input type="radio" className="size-4 accent-[var(--accent)]" {...props} />
      <span>{label}</span>
    </label>
  );
});
