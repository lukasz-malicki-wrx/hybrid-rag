import { memo, useId, type InputHTMLAttributes, type Ref } from "react";
import { cn } from "../lib/cn";
import { SearchIcon } from "../icons";

export type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Accessible name. Always required: the placeholder is not a label. It is visually hidden. */
  label: string;
  ref?: Ref<HTMLInputElement>;
};

/**
 * A 32px search box with a leading icon. Native `type="search"` gives the clear button and
 * the right keyboard on phones; the app's own filtering decides what the text does.
 */
export const SearchField = memo(function SearchField({ label, className, ...props }: SearchFieldProps) {
  const id = useId();
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <SearchIcon width={12} height={12} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        id={id}
        type="search"
        autoComplete="off"
        {...props}
        className="h-8 w-full min-w-0 rounded-lg border border-transparent bg-surface pl-8 pr-3 text-sm font-medium text-fg placeholder:text-muted focus-visible:border-focus"
      />
    </div>
  );
});
