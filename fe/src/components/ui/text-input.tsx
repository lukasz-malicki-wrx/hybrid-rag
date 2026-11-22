import { memo, useId, type InputHTMLAttributes, type Ref } from "react";
import { cn } from "@/lib/cn";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hideLabel?: boolean;
  ref?: Ref<HTMLInputElement>;
};

export const TextInput = memo(function TextInput({ label, hideLabel, className, ...props }: TextInputProps) {
  const id = useId();
  return (
    <>
      <label htmlFor={id} className={hideLabel ? "sr-only" : "block text-sm font-medium"}>
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={cn("min-w-0 rounded-lg border border-border bg-bg px-3 py-1.5", className)}
      />
    </>
  );
});
