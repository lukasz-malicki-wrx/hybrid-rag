import type { Metadata } from "next";
import { BreadcrumbLd } from "@/components/seo/breadcrumb-ld";
import { localeFromParams } from "@/lib/current-locale";
import { buildMetadata } from "@/lib/seo";
import { getTranslator } from "@/lib/translator";
import { ComparisonTable } from "@/sections/pricing/comparison-table";
import { PricingIntro } from "@/sections/pricing/intro";
import { PricingFaq } from "@/sections/pricing/pricing-faq";
import { Plans } from "@/sections/pricing/plans";

export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  return buildMetadata("pricing", await localeFromParams(params));
}

// No Offer or Product structured data: nothing here can be bought.
export default async function PricingPage({ params }: PageProps<"/[locale]/pricing">) {
  const locale = await localeFromParams(params);
  const { t } = getTranslator(locale);
  return (
    <>
      <BreadcrumbLd page="pricing" locale={locale} />
      <PricingIntro t={t} />
      <Plans locale={locale} />
      <ComparisonTable locale={locale} />
      <PricingFaq locale={locale} />
    </>
  );
}
