import type { Metadata } from "next";
import { localeFromParams } from "@/lib/current-locale";
import { getTranslator } from "@/lib/translator";
import { NotFoundContent } from "@/sections/not-found/not-found-content";

export async function generateMetadata({ params }: PageProps<"/[locale]/404">): Promise<Metadata> {
  const { t } = getTranslator(await localeFromParams(params));
  return { title: t("notFound.title"), robots: { index: false } };
}

/**
 * The 404 page. src/proxy.ts rewrites every address that is not a page to this route with status
 * 404, so it is rendered on the server like any page (see there for why not `notFound()`).
 */
export default async function NotFoundPage({ params }: PageProps<"/[locale]/404">) {
  const locale = await localeFromParams(params);
  return <NotFoundContent t={getTranslator(locale).t} locale={locale} />;
}
