import type { ReactNode } from "react";
import { Heading } from "@hybrid-rag/ui/heading";
import { THEME_STORAGE_KEY } from "@hybrid-rag/ui/theme";
import { LegalSection } from "@/components/legal/legal-section";
import { TextLink } from "@/components/ui/text-link";
import { LEGAL } from "@/config/legal";
import type { AppTranslator } from "@/lib/translator";

const NEVER = ["cookies", "analytics", "thirdParty", "forms", "accounts"] as const;

/** What the website itself does and does not do with a visitor's data. */
export function PrivacyWebsite({ t }: { t: AppTranslator["t"] }) {
  const code = { code: (content: ReactNode) => <code>{content}</code> };
  return (
    <LegalSection id="privacy-site" title={t("privacy.site.title")}>
      <Heading level={3} size="h3">
        {t("privacy.site.never.title")}
      </Heading>
      <ul>
        {NEVER.map((item) => (
          <li key={item}>{t(`privacy.site.never.items.${item}`)}</li>
        ))}
      </ul>
      <Heading level={3} size="h3">
        {t("privacy.site.storage.title")}
      </Heading>
      <p>{t.rich("privacy.site.storage.text", code, { key: THEME_STORAGE_KEY })}</p>
      <Heading level={3} size="h3">
        {t("privacy.site.hosting.title")}
      </Heading>
      <p>{t.rich("privacy.site.hosting.text", { link: (content) => <TextLink href={LEGAL.hostPrivacy}>{content}</TextLink> })}</p>
      <Heading level={3} size="h3">
        {t("privacy.site.links.title")}
      </Heading>
      <p>{t("privacy.site.links.text")}</p>
    </LegalSection>
  );
}
