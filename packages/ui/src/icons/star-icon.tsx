import { createIcon, type IconProps } from "./create-icon";
import { Star } from "./glyphs";

const Outline = createIcon("StarIcon", Star);

/** `filled` is the "on" state of a favourite. */
export function StarIcon({ filled, ...props }: IconProps & { filled?: boolean }) {
  return <Outline {...props} fill={filled ? "currentColor" : "none"} />;
}
