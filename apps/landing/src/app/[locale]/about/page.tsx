import type { Metadata } from "next";
import { BreadcrumbLd } from "@/components/seo/breadcrumb-ld";
import { localeFromParams } from "@/lib/current-locale";
import { buildMetadata } from "@/lib/seo";
import { getTranslator } from "@/lib/translator";
import { AboutIntro } from "@/sections/about/intro";
import { Author } from "@/sections/about/author";
import { Contribute } from "@/sections/about/contribute";
import { Licence } from "@/sections/about/licence";
import { PersonLd } from "@/sections/about/person-ld";
import { Principles } from "@/sections/about/principles";
import { Stack } from "@/sections/about/stack";
import { Why } from "@/sections/about/why";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  return buildMetadata("about", await localeFromParams(params));
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const locale = await localeFromParams(params);
  const { t } = getTranslator(locale);
  return (
    <>
      <BreadcrumbLd page="about" locale={locale} />
      <PersonLd locale={locale} />
      <AboutIntro t={t} locale={locale} />
      <Why locale={locale} />
      <Stack locale={locale} />
      <Principles locale={locale} />
      <Contribute locale={locale} />
      <Author locale={locale} />
      <Licence locale={locale} />
    </>
  );
}
