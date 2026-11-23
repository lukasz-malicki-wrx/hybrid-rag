import type { AnchorHTMLAttributes, ComponentType, ReactNode } from "react";
import { cn } from "../lib/cn";

const VARIANTS = {
  // A link inside running text: underlined, because colour alone must not tell it from the words.
  text: "rounded-sm font-medium text-fg underline decoration-accent decoration-2 underline-offset-4 hover:decoration-4",
  // A link in a list of links (a footer): muted, underlined on hover, a 24px target.
  quiet: "inline-flex min-h-6 items-center rounded-sm py-1 text-sm text-muted underline-offset-4 hover:text-fg hover:underline",
  // The same on the dark band (a footer): `band-muted` is the colour with the contrast there.
  band: "inline-flex min-h-6 items-center rounded-sm py-1 text-sm text-band-muted underline-offset-4 hover:text-band-fg hover:underline focus-visible:outline-band-fg",
  // "Learn more" with an arrow after it (the arrow is the caller's icon): in the colour of its
  // surroundings, so it is as legible on a card as on a band.
  arrow: "inline-flex min-h-6 items-center gap-2 rounded-sm py-1 font-medium underline-offset-4 hover:underline",
};

export type TextLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> & {
  href: string;
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  /** The router's link component (next/link) for internal links; a plain <a> without it. */
  as?: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;
};

/** A link that is text, not a button: in a sentence (`text`), in a list of links (`quiet`, `band`) or as a "learn more" (`arrow`). */
export function TextLink({ href, variant = "text", as: Component, className, children, ...props }: TextLinkProps) {
  const classes = cn(VARIANTS[variant], className);
  if (Component) {
    return (
      <Component href={href} className={classes} {...props}>
        {children}
      </Component>
    );
  }
  return (
    <a href={href} className={classes} {...props}>
      {children}
    </a>
  );
}
