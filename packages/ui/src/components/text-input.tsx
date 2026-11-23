import { memo, useId, type InputHTMLAttributes, type Ref } from "react";
import { cn } from "../lib/cn";
import { Field } from "./field";

export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  hideLabel?: boolean;
  /** "title" is for renaming a heading in place: it looks like the bar's title (20px bold). */
  size?: "md" | "title";
  ref?: Ref<HTMLInputElement>;
};

// 16px on phones, where a smaller one makes iOS zoom in on focus; 14px, like the rest, from md.
const SIZES = { md: "text-base md:text-sm", title: "text-xl font-bold" };

export const TextInput = memo(function TextInput({ label, hideLabel, size = "md", className, ...props }: TextInputProps) {
  const id = useId();
  return (
    <Field label={label} hideLabel={hideLabel} htmlFor={id}>
      <input
        id={id}
        {...props}
        className={cn("block min-w-0 rounded-lg border border-border bg-bg px-3 py-1.5", SIZES[size], className)}
      />
    </Field>
  );
});
