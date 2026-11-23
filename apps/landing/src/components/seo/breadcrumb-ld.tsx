import { breadcrumbList } from "@/lib/json-ld";
import type { Locale } from "@/lib/i18n";
import { pagePath, type PageId } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site-url";
import { getTranslator } from "@/lib/translator";
import { JsonLd } from "../ui/json-ld";

/** BreadcrumbList structured data: Home, then the page. For every page except the home page. */
export function BreadcrumbLd({ page, locale }: { page: Exclude<PageId, "home">; locale: Locale }) {
  const { t } = getTranslator(locale);
  return (
    <JsonLd
      data={breadcrumbList([
        { name: t("common.pages.home"), url: absoluteUrl(pagePath("home", locale)) },
        { name: t(`common.pages.${page}`), url: absoluteUrl(pagePath(page, locale)) },
      ])}
    />
  );
}
