import type { Metadata } from "next";
import { BreadcrumbLd } from "@/components/seo/breadcrumb-ld";
import { localeFromParams } from "@/lib/current-locale";
import { buildMetadata } from "@/lib/seo";
import { getTranslator } from "@/lib/translator";
import { AccessibilityIntro } from "@/sections/accessibility/intro";
import { AccessibilityStatement } from "@/sections/accessibility/statement";

export async function generateMetadata({ params }: PageProps<"/[locale]/accessibility">): Promise<Metadata> {
  return buildMetadata("accessibility", await localeFromParams(params));
}

export default async function AccessibilityPage({ params }: PageProps<"/[locale]/accessibility">) {
  const locale = await localeFromParams(params);
  const { t } = getTranslator(locale);
  return (
    <>
      <BreadcrumbLd page="accessibility" locale={locale} />
      <AccessibilityIntro t={t} locale={locale} />
      <AccessibilityStatement t={t} />
    </>
  );
}
