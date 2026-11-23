import { ArrowRightIcon } from "@hybrid-rag/ui/icons";
import { Screenshot } from "@/components/screenshot";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { SITE } from "@/config/site";
import { pagePath } from "@/lib/routes";
import type { HomeSectionProps } from "./props";

const PICTURE_SIZES = "(min-width: 1280px) 540px, (min-width: 1024px) 45vw, 100vw";

/**
 * The top of the home page: the one sentence, two ways on, and the chat screenshot beside them.
 * The screenshot is the largest thing on the first screen, so it loads eagerly.
 */
export function HomeHero({ t, locale }: HomeSectionProps) {
  return (
    <PageHeader
      eyebrow={t("home.hero.eyebrow")}
      title={t("home.hero.title")}
      lead={t("home.hero.lead")}
      media={<Screenshot id="hero-chat" locale={locale} eager sizes={PICTURE_SIZES} />}
      actions={
        <>
          <LinkButton href={SITE.repo} variant="primary" className="max-sm:w-full">
            {t("home.hero.github")}
            <ArrowRightIcon />
          </LinkButton>
          <LinkButton
            href={pagePath("how-it-works", locale)}
            className="pl-1 max-sm:w-full sm:border-transparent"
            icon={
              <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-fg">
                <ArrowRightIcon />
              </span>
            }
          >
            {t("home.hero.how")}
          </LinkButton>
        </>
      }
    />
  );
}
