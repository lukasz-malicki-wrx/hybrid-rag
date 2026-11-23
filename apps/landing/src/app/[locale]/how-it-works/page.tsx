import type { Metadata } from "next";
import { BreadcrumbLd } from "@/components/seo/breadcrumb-ld";
import { localeFromParams } from "@/lib/current-locale";
import { buildMetadata } from "@/lib/seo";
import { getTranslator } from "@/lib/translator";
import { Answer } from "@/sections/how-it-works/answer";
import { Flows } from "@/sections/how-it-works/flows";
import { Fusion } from "@/sections/how-it-works/fusion-section";
import { Gate } from "@/sections/how-it-works/gate";
import { Ingest } from "@/sections/how-it-works/ingest";
import { HowItWorksIntro } from "@/sections/how-it-works/intro";
import { Limits } from "@/sections/how-it-works/limits";
import { More } from "@/sections/how-it-works/more";
import { StoredRecord } from "@/sections/how-it-works/record";
import { Run } from "@/sections/how-it-works/run";
import { Search } from "@/sections/how-it-works/search";
import { Start } from "@/sections/how-it-works/start";

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">): Promise<Metadata> {
  return buildMetadata("how-it-works", await localeFromParams(params));
}

export default async function HowItWorksPage({ params }: PageProps<"/[locale]/how-it-works">) {
  const locale = await localeFromParams(params);
  const { t } = getTranslator(locale);
  return (
    <>
      <BreadcrumbLd page="how-it-works" locale={locale} />
      <HowItWorksIntro t={t} locale={locale} />
      <Flows t={t} locale={locale} />
      <Ingest t={t} locale={locale} />
      <Search t={t} locale={locale} />
      <Fusion t={t} locale={locale} />
      <Gate t={t} locale={locale} />
      <Answer t={t} locale={locale} />
      <StoredRecord t={t} locale={locale} />
      <Run t={t} locale={locale} />
      <Start t={t} locale={locale} />
      <Limits t={t} locale={locale} />
      <More t={t} locale={locale} />
    </>
  );
}
