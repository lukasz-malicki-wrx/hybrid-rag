import type { ReactNode } from "react";
import type { RichTags } from "@hybrid-rag/i18n";
import { InlineCode } from "@/components/ui/inline-code";
import { TextLink } from "@/components/ui/text-link";
import { SITE } from "@/config/site";
import type { Locale } from "@/lib/i18n";
import { pagePath } from "@/lib/routes";

function link(href: string) {
  return function RichLink(children: ReactNode) {
    return <TextLink href={href}>{children}</TextLink>;
  };
}

/**
 * The tags the answers of the FAQ, the about page and the pricing questions may use (`<how>...</how>`):
 * links to the pages and to the repository, and `<code>` for names of settings. A tag a text does
 * not use is simply not rendered.
 */
export function answerTags(locale: Locale): RichTags {
  return {
    code: (children) => <InlineCode>{children}</InlineCode>,
    how: link(pagePath("how-it-works", locale)),
    pricing: link(pagePath("pricing", locale)),
    privacy: link(pagePath("privacy", locale)),
    repo: link(SITE.repo),
    issues: link(SITE.issues),
    licence: link(SITE.licence.url),
    evaluation: link(SITE.docs.evaluation),
    readme: link(SITE.docs.readme),
  };
}
