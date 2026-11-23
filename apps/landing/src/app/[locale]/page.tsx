import type { Metadata } from "next";
import { localeFromParams } from "@/lib/current-locale";
import { buildMetadata } from "@/lib/seo";
import { getTranslator } from "@/lib/translator";
import { About } from "@/sections/home/about";
import { BuiltWith } from "@/sections/home/built-with";
import { Examples } from "@/sections/home/examples";
import { Gallery } from "@/sections/home/gallery";
import { HomeHero } from "@/sections/home/hero";
import { HomeStructuredData } from "@/sections/home/structured-data";
import { Strengths } from "@/sections/home/strengths";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  return buildMetadata("home", await localeFromParams(params));
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = await localeFromParams(params);
  const { t } = getTranslator(locale);
  return (
    <>
      <HomeStructuredData t={t} locale={locale} />
      <HomeHero t={t} locale={locale} />
      <BuiltWith t={t} />
      <Strengths t={t} locale={locale} />
      <About t={t} locale={locale} />
      <Gallery t={t} locale={locale} />
      <Examples t={t} />
    </>
  );
}
