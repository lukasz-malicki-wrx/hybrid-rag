import { AlertIcon, ChatIcon, SendIcon } from "@hybrid-rag/ui/icons";
import { FeatureCard } from "@/components/ui/feature-card";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/lib/i18n";
import { getTranslator } from "@/lib/translator";
import { answerTags } from "@/components/rich-tags";

const WAYS = ["report", "try", "change"] as const;
const ICONS = { report: AlertIcon, try: ChatIcon, change: SendIcon };

/** Three ways to help, from the smallest. */
export function Contribute({ locale }: { locale: Locale }) {
  const { t } = getTranslator(locale);
  const tags = answerTags(locale);
  return (
    <Section labelledBy="contribute-heading" tone="panel">
      <SectionHeading id="contribute-heading" align="center" title={t("about.contribute.heading")} lead={t("about.contribute.lead")} className="mb-heading" />
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {WAYS.map((id) => {
          const Icon = ICONS[id];
          return (
            <FeatureCard
              key={id}
              icon={<Icon width={28} height={28} />}
              title={t(`about.contribute.items.${id}.title`)}
              text={t.rich(`about.contribute.items.${id}.text`, tags)}
            />
          );
        })}
      </ul>
    </Section>
  );
}
