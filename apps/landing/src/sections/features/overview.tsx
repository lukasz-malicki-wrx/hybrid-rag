import type { ComponentType } from "react";
import { ChatIcon, CheckIcon, FileIcon, GroupIcon, LanguagesIcon, SearchIcon, type IconProps } from "@hybrid-rag/ui/icons";
import { FeatureCard } from "@/components/ui/feature-card";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import type { AppTranslator } from "@/lib/translator";
import { FEATURE_GROUPS, type FeatureGroup } from "./groups";

const GROUP_ICONS: Record<FeatureGroup["icon"], ComponentType<IconProps>> = {
  chat: ChatIcon,
  file: FileIcon,
  group: GroupIcon,
  search: SearchIcon,
  check: CheckIcon,
  languages: LanguagesIcon,
};

/** The six areas as cards, each linking to its part of the page below. */
export function FeaturesOverview({ t }: { t: AppTranslator["t"] }) {
  return (
    <Section labelledBy="features-overview">
      <SectionHeading id="features-overview" align="center" eyebrow={t("features.overview.eyebrow")} title={t("features.overview.title")} className="mb-heading" />
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {FEATURE_GROUPS.map((group) => {
          const Icon = GROUP_ICONS[group.icon];
          return (
            <FeatureCard
              key={group.id}
              icon={<Icon width={28} height={28} />}
              title={t(`features.groups.${group.id}.title`)}
              text={t(`features.groups.${group.id}.lead`)}
              link={{ href: `#${group.id}`, label: t(`features.groups.${group.id}.more`) }}
            />
          );
        })}
      </ul>
    </Section>
  );
}
