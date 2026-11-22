import { memo, type ButtonHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-ghost" | "link";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-fg font-semibold hover:opacity-90",
  secondary: "border border-border font-medium hover:bg-surface",
  ghost: "text-fg hover:bg-surface-2",
  danger: "bg-danger font-semibold text-danger-fg hover:opacity-90",
  "danger-ghost": "text-danger hover:bg-surface-2",
  link: "text-accent hover:underline",
};

export type ButtonSize = "sm" | "md" | "inline";

/** Each size owns height, padding, radius and text size so none of them has to be overridden. */
const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 rounded-lg px-4 text-sm",
  sm: "min-h-10 rounded-lg px-3 text-sm",
  // Sits inside running text (e.g. a citation number): no minimum height, text-sized.
  inline: "rounded px-0.5 py-px align-baseline text-xs leading-none",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
};

export const Button = memo(function Button({
  variant = "secondary",
  size = "md",
  icon,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center cursor-pointer justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60",
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
});
