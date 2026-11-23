import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { PLANS } from "@/config/pricing";
import type { Locale } from "@/lib/i18n";
import { getTranslator } from "@/lib/translator";
import { PlanCard } from "./plan-card";
import { PreviewNotice } from "./preview-notice";

/** The three plans side by side, equal in size and weight, under the notice that nothing can be bought. */
export function Plans({ locale }: { locale: Locale }) {
  const { t } = getTranslator(locale);
  return (
    <Section labelledBy="plans-heading">
      <SectionHeading id="plans-heading" align="center" eyebrow={t("pricing.plans.eyebrow")} title={t("pricing.plans.title")} className="mb-10" />
      <PreviewNotice t={t} />
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} locale={locale} />
        ))}
      </ul>
    </Section>
  );
}
