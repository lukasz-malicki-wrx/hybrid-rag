import { RepoIcon } from "@hybrid-rag/ui/icons";
import { SITE } from "@/config/site";
import type { Locale } from "@/lib/i18n";
import { pagePath } from "@/lib/routes";
import { getTranslator } from "@/lib/translator";
import { ArrowLink } from "../ui/arrow-link";
import { Container } from "../ui/container";
import { CtaBand } from "../ui/cta-band";
import { LinkButton } from "../ui/link-button";

/**
 * The call to action at the end of every page: the same words everywhere. It sits half on the page
 * and half on the dark footer, so the bottom half of its box has the footer's colour. Under it, on a
 * wide screen, a dark spacer adds to the footer's own top padding: about 160px from the band to the footer's content.
 */
export function SiteCta({ locale }: { locale: Locale }) {
  const { t } = getTranslator(locale);
  return (
    <div className="pt-section-tight">
      <div className="relative">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-band" />
        <Container className="relative">
          <CtaBand id="site-cta" title={t("common.cta.title")} text={t("common.cta.text")} command={t("common.cta.command")}>
            <LinkButton href={SITE.repo} variant="band" icon={<RepoIcon />} className="w-full sm:w-auto">
              {t("common.cta.github")}
            </LinkButton>
            <ArrowLink href={pagePath("how-it-works", locale)} className="w-full justify-center sm:w-auto sm:justify-start">
              {t("common.cta.how")}
            </ArrowLink>
          </CtaBand>
        </Container>
      </div>
      <div aria-hidden="true" className="h-0 bg-band lg:h-24" />
    </div>
  );
}
