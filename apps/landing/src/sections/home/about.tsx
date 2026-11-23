import { ArrowRightIcon } from "@hybrid-rag/ui/icons";
import { Text } from "@hybrid-rag/ui/text";
import { Screenshot } from "@/components/screenshot";
import { AccentParagraph } from "@/components/ui/accent-paragraph";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { SplitSection } from "@/components/ui/split-section";
import { pagePath } from "@/lib/routes";
import { Numbers } from "./numbers";
import type { HomeSectionProps } from "./props";

const PICTURE_SIZES = "(min-width: 1280px) 540px, (min-width: 1024px) 45vw, 100vw";

/** Why it exists, beside the sources panel, and the measured result under it. */
export function About({ t, locale }: HomeSectionProps) {
  return (
    <section aria-labelledby="home-about" className="surface-panel pb-20 pt-0 lg:pb-30 lg:pt-section">
      <Container>
        <SplitSection side="left" doodle bleed media={<Screenshot id="about-sources" locale={locale} sizes={PICTURE_SIZES} />}>
          <SectionHeading id="home-about" eyebrow={t("home.about.eyebrow")} title={t("home.about.title")} />
          <AccentParagraph className="mt-10">{t("home.about.problem")}</AccentParagraph>
          <Text size="lead" tone="muted" className="mt-6 max-w-copy">
            {t("home.about.solution")}
          </Text>
          <LinkButton href={pagePath("how-it-works", locale)} variant="primary" className="mt-10 sm:mt-15 max-sm:w-full">
            {t("home.about.link")}
            <ArrowRightIcon />
          </LinkButton>
        </SplitSection>
        <Numbers t={t} locale={locale} />
      </Container>
    </section>
  );
}
