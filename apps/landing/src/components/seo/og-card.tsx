import { SITE_PALETTE } from "@/config/palette";
import { ogTitleSize } from "@/lib/og-image";
import { OgMark } from "./og-mark";

const { bg, accent, accentFg } = SITE_PALETTE;

type OgCardProps = {
  /** The site name beside the mark. */
  name: string;
  title: string;
  description: string;
};

/**
 * The 1200x630 card of a page, drawn for the image renderer (flexbox and inline styles only, which
 * is what it supports). Colours are the palette's: the dark background, the accent tile of the
 * app's mark, and the light background colour for the text.
 */
export function OgCard({ name, title, description }: OgCardProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 72,
        background: bg.dark,
        color: bg.light,
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", position: "absolute", right: -40, bottom: -60, opacity: 0.1, color: accent.dark }}>
        <OgMark size={460} strokeWidth={1.25} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 16,
            background: accent.dark,
            color: accentFg.dark,
          }}
        >
          <OgMark size={36} strokeWidth={2} />
        </div>
        <div style={{ fontSize: 38, fontWeight: 600, letterSpacing: -0.5 }}>{name}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 980 }}>
        <div style={{ display: "flex", width: 80, height: 6, background: accent.dark }} />
        <div style={{ fontSize: ogTitleSize(title), fontWeight: 600, lineHeight: 1.08, letterSpacing: -2 }}>{title}</div>
        <div style={{ fontSize: 32, fontWeight: 400, lineHeight: 1.4, opacity: 0.75 }}>{description}</div>
      </div>
    </div>
  );
}
