import { Screenshot } from "@/components/screenshot";
import { PageHeader } from "@/components/ui/page-header";
import type { SectionProps } from "./section-props";

/** The top of the page: the label, the h1, the paragraph, and the chat beside them. */
export function HowItWorksIntro({ t, locale }: SectionProps) {
  return (
    <PageHeader
      eyebrow={t("howItWorks.hero.eyebrow")}
      title={t("howItWorks.hero.title")}
      lead={t("howItWorks.hero.lead")}
      media={<Screenshot id="how-flow" locale={locale} eager sizes="(min-width: 1152px) 540px, 100vw" />}
    />
  );
}
