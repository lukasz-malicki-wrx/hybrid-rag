import { SITE_PALETTE } from "@/config/palette";
import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { getTranslator } from "@/lib/translator";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: getTranslator(DEFAULT_LOCALE).t("meta.manifest.description"),
    start_url: "/",
    display: "browser",
    background_color: SITE_PALETTE.bg.light,
    theme_color: SITE_PALETTE.accent.light,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
