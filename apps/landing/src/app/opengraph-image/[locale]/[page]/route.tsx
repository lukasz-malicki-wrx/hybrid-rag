import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { OgCard } from "@/components/seo/og-card";
import { SITE } from "@/config/site";
import { loadOgFonts } from "@/lib/og-fonts";
import { OG_SIZE, ogImageParams, parseOgParams } from "@/lib/og-image";
import { getTranslator } from "@/lib/translator";

// Drawn once per page and language at build time and served as a file.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return ogImageParams();
}

/** The Open Graph and Twitter card of one page in one language: its title and description from the translations. */
export async function GET(_request: Request, { params }: RouteContext<"/opengraph-image/[locale]/[page]">) {
  const { locale: rawLocale, page } = await params;
  const parsed = parseOgParams(rawLocale, page);
  if (!parsed) notFound();
  const { t } = getTranslator(parsed.locale);
  return new ImageResponse(
    <OgCard name={SITE.name} title={t(`meta.${parsed.id}.title`)} description={t(`meta.${parsed.id}.description`)} />,
    { ...OG_SIZE, fonts: await loadOgFonts() },
  );
}
