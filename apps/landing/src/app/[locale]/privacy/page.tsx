import type { Metadata } from "next";
import { BreadcrumbLd } from "@/components/seo/breadcrumb-ld";
import { localeFromParams } from "@/lib/current-locale";
import { buildMetadata } from "@/lib/seo";
import { getTranslator } from "@/lib/translator";
import { PrivacyApp } from "@/sections/privacy/app";
import { PrivacyIntro } from "@/sections/privacy/intro";
import { PrivacyResponsible } from "@/sections/privacy/responsible";
import { PrivacyWebsite } from "@/sections/privacy/website";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  return buildMetadata("privacy", await localeFromParams(params));
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const locale = await localeFromParams(params);
  const { t } = getTranslator(locale);
  return (
    <>
      <BreadcrumbLd page="privacy" locale={locale} />
      <PrivacyIntro t={t} locale={locale} />
      <PrivacyWebsite t={t} />
      <PrivacyApp t={t} locale={locale} />
      <PrivacyResponsible t={t} />
    </>
  );
}
