import { CheckIcon, ComputerIcon, SearchIcon, UnknownIcon } from "@hybrid-rag/ui/icons";
import { FeatureCard } from "@/components/ui/feature-card";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { pagePath } from "@/lib/routes";
import type { HomeSectionProps } from "./props";

const ICON = { width: 28, height: 28 } as const;

/** Four strengths, each with a link to the page that explains it. */
export function Strengths({ t, locale }: HomeSectionProps) {
  const items = [
    { id: "checkable", icon: <CheckIcon {...ICON} />, href: `${pagePath("features", locale)}#sources` },
    { id: "honest", icon: <UnknownIcon {...ICON} />, href: `${pagePath("how-it-works", locale)}#hiw-gate` },
    { id: "local", icon: <ComputerIcon {...ICON} />, href: pagePath("privacy", locale) },
    { id: "twoWays", icon: <SearchIcon {...ICON} />, href: `${pagePath("how-it-works", locale)}#hiw-search` },
  ] as const;
  return (
    <Section labelledBy="home-strengths">
      <SectionHeading
        id="home-strengths"
        eyebrow={t("home.strengths.eyebrow")}
        title={t("home.strengths.title")}
        align="center"
        className="mb-heading"
      />
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(({ id, icon, href }) => (
          <FeatureCard
            key={id}
            icon={icon}
            title={t(`home.strengths.items.${id}.title`)}
            text={t(`home.strengths.items.${id}.text`)}
            link={{ href, label: t(`home.strengths.items.${id}.link`) }}
          />
        ))}
      </ul>
    </Section>
  );
}
