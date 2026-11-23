import { ArrowRightIcon } from "@hybrid-rag/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import type { Locale } from "@/lib/i18n";
import { pagePath } from "@/lib/routes";
import type { AppTranslator } from "@/lib/translator";

/** The 404 in the visitor's language: what happened and three ways on (home, features, FAQ). */
export function NotFoundContent({ t, locale }: { t: AppTranslator["t"]; locale: Locale }) {
  return (
    <PageHeader
      eyebrow={t("notFound.eyebrow")}
      title={t("notFound.h1")}
      lead={t("notFound.text")}
      actions={
        <>
          <LinkButton href={pagePath("home", locale)} variant="primary" icon={<ArrowRightIcon />}>
            {t("notFound.home")}
          </LinkButton>
          <LinkButton href={pagePath("features", locale)}>{t("notFound.features")}</LinkButton>
          <LinkButton href={pagePath("faq", locale)}>{t("notFound.faq")}</LinkButton>
        </>
      }
    />
  );
}
