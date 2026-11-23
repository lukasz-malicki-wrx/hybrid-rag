import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClass, type ButtonSize, type ButtonVariant } from "@hybrid-rag/ui/button";
import { cn } from "@hybrid-rag/ui/cn";

type LinkButtonProps = {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  /** Layout classes only (width, margin): variant and size own the rest. */
  className?: string;
  children: ReactNode;
};

/** In forced-colors mode backgrounds are dropped: a border keeps the button's shape. */
const FORCED_COLORS = "forced-colors:border forced-colors:border-[ButtonText]";

/**
 * A link that looks like a button, through the same `buttonClass` as the app's buttons. Paths
 * starting with "/" use the Next router; anything else is a plain link, opened in the same tab.
 */
export function LinkButton({ href, variant = "secondary", size = "md", icon, className, children }: LinkButtonProps) {
  const classes = buttonClass({ variant, size, className: cn(FORCED_COLORS, className) });
  const content = (
    <>
      {icon}
      {children}
    </>
  );
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <a href={href} className={classes}>
      {content}
    </a>
  );
}
