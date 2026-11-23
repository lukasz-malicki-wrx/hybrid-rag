import type { ReactNode } from "react";
import { Heading } from "@hybrid-rag/ui/heading";
import { LegalSection } from "@/components/legal/legal-section";
import { TextLink } from "@/components/ui/text-link";
import { LEGAL } from "@/config/legal";
import type { Locale } from "@/lib/i18n";
import { messageParams } from "@/lib/message-params";
import type { AppTranslator } from "@/lib/translator";

/** Where the data of the app goes: separate from the website, because the app is something a visitor runs. */
export function PrivacyApp({ t, locale }: { t: AppTranslator["t"]; locale: Locale }) {
  const tags = {
    code: (content: ReactNode) => <code>{content}</code>,
    link: (content: ReactNode) => <TextLink href={LEGAL.anthropicPrivacy}>{content}</TextLink>,
  };
  const params = messageParams(t, locale);
  return (
    <LegalSection id="privacy-app" tone="panel" title={t("privacy.app.title")} lead={t("privacy.app.lead")}>
      <Heading level={3} size="h3">
        {t("privacy.app.local.title")}
      </Heading>
      <p>{t.rich("privacy.app.local.text", tags)}</p>
      <Heading level={3} size="h3">
        {t("privacy.app.claude.title")}
      </Heading>
      <p>{t.rich("privacy.app.claude.text", tags, params)}</p>
      <Heading level={3} size="h3">
        {t("privacy.app.access.title")}
      </Heading>
      <p>{t("privacy.app.access.text")}</p>
    </LegalSection>
  );
}
