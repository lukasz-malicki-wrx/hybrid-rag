import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { PAGE_IDS, pagePath } from "@/lib/routes";
import { languageAlternates } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";

/** Every page in every language, each entry listing its translations (hreflang) and x-default. */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = (id: (typeof PAGE_IDS)[number]) =>
    Object.fromEntries(Object.entries(languageAlternates(id)).map(([lang, path]) => [lang, absoluteUrl(path)]));
  return PAGE_IDS.flatMap((id) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(pagePath(id, locale)),
      changeFrequency: "monthly" as const,
      priority: id === "home" ? 1 : 0.7,
      alternates: { languages: languages(id) },
    })),
  );
}
