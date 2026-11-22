import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

/** Base for all icons: 24x24 outline, decorative (hidden from assistive technology). */
export function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}
