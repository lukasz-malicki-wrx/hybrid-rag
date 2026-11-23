import { LegalSection } from "@/components/legal/legal-section";
import { TextLink } from "@/components/ui/text-link";
import { SITE } from "@/config/site";
import type { AppTranslator } from "@/lib/translator";

/** Who answers for the site, how to reach them, and what this page is not. */
export function PrivacyResponsible({ t }: { t: AppTranslator["t"] }) {
  return (
    <LegalSection id="privacy-who" title={t("privacy.who.title")}>
      <p>{t.rich("privacy.who.text", { link: (content) => <TextLink href={SITE.issues}>{content}</TextLink> })}</p>
      <p>{t("privacy.who.changes")}</p>
      <p>{t("privacy.who.notLegal")}</p>
    </LegalSection>
  );
}
