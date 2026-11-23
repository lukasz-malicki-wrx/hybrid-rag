import { memo, type ButtonHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "../lib/cn";
import { tileClass } from "../lib/tile";

export type IconButtonVariant = "default" | "compact" | "tile" | "accent";

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Accessible name; icon-only buttons must have one. */
  label: string;
  icon: ReactNode;
  /** Toggle buttons (e.g. favourite) expose their state with aria-pressed. */
  pressed?: boolean;
  /** "strong" is a bare icon in the text colour instead of the muted one. */
  tone?: "default" | "strong" | "danger";
  /**
   * "default" is a bare icon with padding, for use inside rows and fields; "compact" is the same
   * with less padding, for chips. "tile" is the 32x32 button on a surface used in pane bars and
   * the sidebar; "accent" is that tile in the accent colour (the primary action of a column).
   * Each variant owns its padding and colours, so none has to be overridden with `className`.
   */
  variant?: IconButtonVariant;
  ref?: Ref<HTMLButtonElement>;
};

const BARE = "inline-flex cursor-pointer items-center justify-center rounded-lg hover:bg-surface-2 aria-pressed:text-accent";

const BARE_TEXT = {
  default: "text-muted hover:text-fg",
  strong: "text-fg hover:text-fg",
  danger: "text-muted hover:text-danger",
};

function variantClass(variant: IconButtonVariant, tone: NonNullable<IconButtonProps["tone"]>): string {
  // The accent tile is a plain action: no pressed look, no danger tone.
  if (variant === "accent") return tileClass("accent");
  if (variant === "tile") return tileClass(tone === "danger" ? "danger" : "surface");
  return cn(BARE, BARE_TEXT[tone], variant === "compact" ? "p-1.5" : "p-2");
}

export const IconButton = memo(function IconButton({
  label,
  icon,
  pressed,
  tone = "default",
  variant = "default",
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      aria-pressed={pressed}
      className={cn(variantClass(variant, tone), className)}
      {...props}
    >
      {icon}
    </button>
  );
});
