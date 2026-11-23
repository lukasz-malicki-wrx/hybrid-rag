import type { Metadata } from "next";
import { getLocale } from "@/lib/current-locale";
import { getTranslator } from "@/lib/translator";
import { NotFoundContent } from "@/sections/not-found/not-found-content";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getTranslator(await getLocale()).t("notFound.title") };
}

export default async function NotFound() {
  const locale = await getLocale();
  return <NotFoundContent t={getTranslator(locale).t} locale={locale} />;
}
