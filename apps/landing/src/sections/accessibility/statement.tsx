import { LegalSection } from "@/components/legal/legal-section";
import { TextLink } from "@/components/ui/text-link";
import { SITE } from "@/config/site";
import type { AppTranslator } from "@/lib/translator";

const BUILT = ["structure", "keyboard", "targets", "reflow", "contrast", "motion", "forced", "language", "noScript"] as const;
const CHECKED = ["axe", "keyboard", "layout", "lighthouse"] as const;
const LIMITS = ["automated", "people", "screenshots", "languages", "app"] as const;

/** The body of the statement: status, how the site was built and checked, known limits, how to report. */
export function AccessibilityStatement({ t }: { t: AppTranslator["t"] }) {
  return (
    <>
      <LegalSection id="a11y-status" title={t("accessibility.status.title")}>
        <p>{t("accessibility.status.text")}</p>
        <p>{t("accessibility.status.method")}</p>
      </LegalSection>
      <LegalSection id="a11y-built" title={t("accessibility.built.title")} tone="panel">
        <ul>
          {BUILT.map((item) => (
            <li key={item}>{t(`accessibility.built.items.${item}`)}</li>
          ))}
        </ul>
      </LegalSection>
      <LegalSection id="a11y-checked" title={t("accessibility.checked.title")} lead={t("accessibility.checked.lead")}>
        <ul>
          {CHECKED.map((item) => (
            <li key={item}>{t(`accessibility.checked.items.${item}`)}</li>
          ))}
        </ul>
      </LegalSection>
      <LegalSection id="a11y-limits" title={t("accessibility.limits.title")} tone="panel">
        <ul>
          {LIMITS.map((item) => (
            <li key={item}>{t(`accessibility.limits.items.${item}`)}</li>
          ))}
        </ul>
      </LegalSection>
      <LegalSection id="a11y-report" title={t("accessibility.report.title")}>
        <p>{t.rich("accessibility.report.text", { link: (content) => <TextLink href={SITE.issues}>{content}</TextLink> })}</p>
      </LegalSection>
    </>
  );
}
