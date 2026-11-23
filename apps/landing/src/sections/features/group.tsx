import { Heading } from "@hybrid-rag/ui/heading";
import { Text } from "@hybrid-rag/ui/text";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { SplitSection } from "@/components/ui/split-section";
import { SITE } from "@/config/site";
import { factParams } from "@/config/facts";
import type { Locale } from "@/lib/i18n";
import type { AppTranslator } from "@/lib/translator";
import { GroupMedia } from "./group-media";
import { FEATURE_GROUPS, type FeatureGroup } from "./groups";

/** One group: its screenshots on one side, its name, sentence and details on the other. The sides and the tint alternate. */
function FeatureGroupSection({ group, index, t, locale }: { group: FeatureGroup; index: number; t: AppTranslator["t"]; locale: Locale }) {
  const headingId = `features-${group.id}`;
  const facts = factParams(locale);
  return (
    <Section id={group.id} labelledBy={headingId} tone={index % 2 === 0 ? "panel" : "plain"} className="scroll-mt-6">
      <SplitSection align="top" media={<GroupMedia group={group} locale={locale} />} side={index % 2 === 0 ? "left" : "right"}>
        <SectionHeading id={headingId} title={t(`features.groups.${group.id}.title`)} lead={t(`features.groups.${group.id}.lead`)} />
        <ul className="mt-8 flex flex-col gap-5">
          {group.items.map((item) => (
            <li key={item}>
              <Heading level={3} size="title">
                {t(`features.items.${item}.title`, facts)}
              </Heading>
              <Text size="sm" tone="muted" className="mt-1">
                {t(`features.items.${item}.text`, facts)}
              </Text>
            </li>
          ))}
        </ul>
        {group.id === "quality" ? (
          <ArrowLink href={SITE.docs.evaluation} className="mt-6">
            {t("features.more.evaluation")}
          </ArrowLink>
        ) : null}
      </SplitSection>
    </Section>
  );
}

export function FeatureGroups({ t, locale }: { t: AppTranslator["t"]; locale: Locale }) {
  return FEATURE_GROUPS.map((group, index) => <FeatureGroupSection key={group.id} group={group} index={index} t={t} locale={locale} />);
}
