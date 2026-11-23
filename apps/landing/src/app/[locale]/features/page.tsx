import type { Metadata } from "next";
import { BreadcrumbLd } from "@/components/seo/breadcrumb-ld";
import { localeFromParams } from "@/lib/current-locale";
import { buildMetadata } from "@/lib/seo";
import { getTranslator } from "@/lib/translator";
import { FeatureGroups } from "@/sections/features/group";
import { FeaturesHero } from "@/sections/features/hero";
import { FeaturesOverview } from "@/sections/features/overview";

export async function generateMetadata({ params }: PageProps<"/[locale]/features">): Promise<Metadata> {
  return buildMetadata("features", await localeFromParams(params));
}

export default async function FeaturesPage({ params }: PageProps<"/[locale]/features">) {
  const locale = await localeFromParams(params);
  const { t } = getTranslator(locale);
  return (
    <>
      <BreadcrumbLd page="features" locale={locale} />
      <FeaturesHero t={t} locale={locale} />
      <FeaturesOverview t={t} />
      <FeatureGroups t={t} locale={locale} />
    </>
  );
}
