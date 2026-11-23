import { JsonLd } from "@/components/ui/json-ld";
import { SITE } from "@/config/site";
import type { Locale } from "@/lib/i18n";
import { pagePath } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site-url";

/** Person structured data: the name and the two profiles, nothing more is claimed. */
export function PersonLd({ locale }: { locale: Locale }) {
  return (
    <JsonLd
      data={{
        "@type": "Person",
        name: SITE.author.name,
        url: absoluteUrl(pagePath("about", locale)),
        sameAs: [SITE.github, SITE.linkedin],
      }}
    />
  );
}
