import type { Metadata } from "next";
import { BreadcrumbLd } from "@/components/seo/breadcrumb-ld";
import { localeFromParams } from "@/lib/current-locale";
import { buildMetadata } from "@/lib/seo";
import { getTranslator } from "@/lib/translator";
import { FaqGroups } from "@/sections/faq/faq-groups";
import { FaqLd } from "@/sections/faq/faq-ld";
import { FaqMore } from "@/sections/faq/faq-more";
import { FaqIntro } from "@/sections/faq/intro";

export async function generateMetadata({ params }: PageProps<"/[locale]/faq">): Promise<Metadata> {
  return buildMetadata("faq", await localeFromParams(params));
}

export default async function FaqPage({ params }: PageProps<"/[locale]/faq">) {
  const locale = await localeFromParams(params);
  const { t } = getTranslator(locale);
  return (
    <>
      <BreadcrumbLd page="faq" locale={locale} />
      <FaqLd locale={locale} />
      <FaqIntro t={t} />
      <FaqGroups locale={locale} />
      <FaqMore locale={locale} />
    </>
  );
}
