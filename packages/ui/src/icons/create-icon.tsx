import type { ComponentType, SVGProps } from "react";
import { cn } from "../lib/cn";

/** What every icon accepts, whatever set it comes from: plain SVG attributes. */
export type IconProps = Omit<SVGProps<SVGSVGElement>, "ref">;

/**
 * Wraps a glyph of the icon set in this app's defaults: 18px, the stroke of the design, and
 * decorative (hidden from assistive technology; the control around it has the name).
 */
export function createIcon(name: string, Glyph: ComponentType<IconProps>, defaults: IconProps = {}) {
  function AppIcon({ className, ...props }: IconProps) {
    return (
      <Glyph
        width={18}
        height={18}
        strokeWidth={1.75}
        aria-hidden="true"
        focusable="false"
        {...defaults}
        {...props}
        className={cn(defaults.className, className)}
      />
    );
  }
  AppIcon.displayName = name;
  return AppIcon;
}
