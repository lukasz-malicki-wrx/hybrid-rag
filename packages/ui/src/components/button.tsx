import { memo, type ButtonHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "../lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "danger-ghost"
  | "link"
  // Muted text that turns to full colour on hover; marks the current page with aria-current.
  // For navigation (a header's links) rather than actions. A menu button whose page is inside it
  // carries aria-current="true".
  | "quiet"
  // On a surface: a link or button that is a small tile in a bar (e.g. "Open PDF").
  | "tile"
  // On the `chip` role colour (answer actions): only `fg` text has the contrast there.
  | "chip"
  // Transparent until hovered, for controls inside the message box, whose hover colour is `chip`.
  | "chip-ghost"
  // On the accent band of the landing page (the call to action): the dark band colour as a fill.
  | "band";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-fg font-semibold hover:opacity-90",
  secondary: "border border-border font-medium hover:bg-surface",
  ghost: "text-fg hover:bg-surface-2",
  danger: "bg-danger font-semibold text-danger-fg hover:opacity-90",
  "danger-ghost": "text-danger hover:bg-surface-2",
  link: "text-accent hover:underline",
  quiet:
    "font-medium text-muted hover:bg-surface-2 hover:text-fg aria-[current=page]:text-fg aria-[current=page]:underline aria-[current=page]:decoration-accent aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8 aria-[current=true]:text-fg aria-[current=true]:underline aria-[current=true]:decoration-accent aria-[current=true]:decoration-2 aria-[current=true]:underline-offset-8",
  tile: "bg-surface font-medium hover:bg-surface-2",
  chip: "bg-chip font-medium text-fg hover:opacity-80",
  "chip-ghost": "font-medium text-fg hover:bg-chip",
  band: "bg-band font-semibold text-band-fg hover:opacity-90",
};

export type ButtonSize = "md" | "sm" | "text" | "field" | "tile" | "xs" | "icon" | "inline";

/** Each size owns height, padding, gap, radius and text size so none of them has to be overridden. */
const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 gap-1.5 rounded-lg px-4 text-sm",
  sm: "min-h-10 gap-1.5 rounded-lg px-3 text-sm",
  // A link-looking button inside a form: no side padding, so its text lines up with the rest.
  text: "min-h-10 gap-1.5 rounded-lg text-sm",
  // A control inside the message box.
  field: "min-h-10 gap-1.5 rounded-lg px-2.5 text-xs",
  // 32px, the height of the tiles in bars.
  tile: "min-h-8 gap-1.5 rounded-lg px-3 text-xs",
  // 24px: the small buttons under an answer.
  xs: "h-6 gap-1 rounded-lg px-2.5 text-xs",
  // A square with just an icon (give it an aria-label).
  icon: "size-10 rounded-lg",
  // Sits inside running text (e.g. a citation number): no minimum height, text-sized.
  inline: "gap-1.5 rounded px-0.5 py-px align-baseline text-xs leading-none",
};

const BASE = "inline-flex cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-60";

/**
 * The classes of a button, for the elements that have to be links but look like buttons. Callers
 * add layout classes (width, margin) only; the variant and size own everything else.
 */
export function buttonClass({
  variant = "secondary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return cn(BASE, SIZES[size], VARIANTS[variant], className);
}

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
    <button type={type} className={buttonClass({ variant, size, className })} {...props}>
      {icon}
      {children}
    </button>
  );
});
