import { PageHeader } from "@/components/ui/page-header";
import type { AppTranslator } from "@/lib/translator";

/** The top of the page: the label, the h1 and the paragraph under it. */
export function FaqIntro({ t }: { t: AppTranslator["t"] }) {
  return <PageHeader eyebrow={t("faq.hero.eyebrow")} title={t("faq.hero.title")} lead={t("faq.hero.lead")} />;
}
