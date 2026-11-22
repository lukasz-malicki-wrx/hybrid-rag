import { memo, type ButtonHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "../lib/cn";

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Accessible name; icon-only buttons must have one. */
  label: string;
  icon: ReactNode;
  /** Toggle buttons (e.g. favourite) expose their state with aria-pressed. */
  pressed?: boolean;
  tone?: "default" | "danger";
  ref?: Ref<HTMLButtonElement>;
};

export const IconButton = memo(function IconButton({
  label,
  icon,
  pressed,
  tone = "default",
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      aria-pressed={pressed}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-muted hover:bg-surface-2 aria-pressed:text-accent",
        tone === "danger" ? "hover:text-danger" : "hover:text-fg",
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
});
