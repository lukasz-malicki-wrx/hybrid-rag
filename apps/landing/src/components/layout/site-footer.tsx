import type { ReactNode } from "react";
import { Heading } from "@hybrid-rag/ui/heading";
import { RepoIcon } from "@hybrid-rag/ui/icons";
import { Text } from "@hybrid-rag/ui/text";
import { SITE } from "@/config/site";
import type { Locale } from "@/lib/i18n";
import { LEGAL_PAGE_IDS, pagePath, PRODUCT_PAGE_IDS, type PageId } from "@/lib/routes";
import { getTranslator } from "@/lib/translator";
import { Container } from "../ui/container";
import { LinkButton } from "../ui/link-button";
import { TextLink } from "../ui/text-link";
import { Brand } from "./brand";
import { PageOnly } from "./page-only";
import { SiteCta } from "./site-cta";

function LinkGroup({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
  // A nav per group, named by its heading: a screen reader's landmark list shows Product, Project, Information.
  return (
    <nav aria-labelledby={id}>
      <Heading id={id} level={2} size="title">
        {heading}
      </Heading>
      <ul className="mt-4 flex flex-col gap-1">{children}</ul>
    </nav>
  );
}

/**
 * The end of every page: the call to action (not on a 404), then the dark footer with the brand,
 * the project's GitHub and three columns of links, and the copyright line.
 */
export function SiteFooter({ locale }: { locale: Locale }) {
  const { t } = getTranslator(locale);
  const page = (id: PageId) => (
    <li key={id}>
      <TextLink href={pagePath(id, locale)} variant="band">
        {t(`common.pages.${id}`)}
      </TextLink>
    </li>
  );
  const external = (href: string, label: string) => (
    <li>
      <TextLink href={href} variant="band">
        {label}
      </TextLink>
    </li>
  );
  return (
    <>
      <PageOnly>
        <SiteCta locale={locale} />
      </PageOnly>
      <footer aria-label={t("common.footer.label")} className="on-band bg-band text-band-fg">
        <Container className="grid grid-cols-1 gap-12 pb-12 pt-16 lg:grid-cols-[minmax(0,22rem)_1px_minmax(0,1fr)] lg:gap-x-16">
          <div className="flex flex-col items-start gap-5">
            <Brand locale={locale} label={t("common.homeLink")} />
            <Text size="sm" tone="band-muted" className="max-w-xs">
              {t("common.footer.tagline")}
            </Text>
            <LinkButton href={SITE.github} variant="primary" icon={<RepoIcon />}>
              {t("common.footer.follow")}
            </LinkButton>
          </div>
          <div aria-hidden="true" className="hidden bg-band-muted/40 lg:block" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
            <LinkGroup id="footer-product" heading={t("common.footer.productHeading")}>
              {PRODUCT_PAGE_IDS.map(page)}
            </LinkGroup>
            <LinkGroup id="footer-project" heading={t("common.footer.projectHeading")}>
              {page("about")}
              {external(SITE.repo, t("common.footer.github"))}
              {external(SITE.issues, t("common.footer.issues"))}
              {external(SITE.linkedin, t("common.footer.linkedin"))}
            </LinkGroup>
            <LinkGroup id="footer-legal" heading={t("common.footer.legalHeading")}>
              {LEGAL_PAGE_IDS.map(page)}
              {external(SITE.licence.url, t("common.footer.licence"))}
            </LinkGroup>
          </div>
        </Container>
        <Container>
          <div className="flex flex-col gap-1 border-t border-band-muted/40 py-6 sm:flex-row sm:justify-between">
            <Text size="sm" tone="band-muted">
              {t("common.footer.copyright", { year: SITE.year, author: SITE.author.name, licence: t("common.footer.licence") })}
            </Text>
            <Text size="sm" tone="band-muted">
              {t("common.footer.note")}
            </Text>
          </div>
        </Container>
      </footer>
    </>
  );
}
