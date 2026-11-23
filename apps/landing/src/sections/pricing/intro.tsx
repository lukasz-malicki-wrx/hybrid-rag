import { PageHeader } from "@/components/ui/page-header";
import type { AppTranslator } from "@/lib/translator";

/** The top of the page: the label, the h1 and the paragraph under it. */
export function PricingIntro({ t }: { t: AppTranslator["t"] }) {
  return <PageHeader eyebrow={t("pricing.hero.eyebrow")} title={t("pricing.hero.title")} lead={t("pricing.hero.lead")} />;
}
