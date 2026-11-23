import { ExternalIcon, RepoIcon } from "@hybrid-rag/ui/icons";
import { Text } from "@hybrid-rag/ui/text";
import { Columns } from "@/components/ui/columns";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/config/site";
import type { Locale } from "@/lib/i18n";
import { getTranslator } from "@/lib/translator";
import { answerTags } from "@/components/rich-tags";

/** Who makes it: the name, the country and two links. No e-mail, no photo, nothing else about the person. */
export function Author({ locale }: { locale: Locale }) {
  const { t } = getTranslator(locale);
  return (
    <Section labelledBy="author-heading">
      <Columns aside={<SectionHeading id="author-heading" title={t("about.author.heading")} lead={t("about.author.text", { author: SITE.author.name })} />}>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={SITE.github} variant="primary" icon={<RepoIcon />}>
            {t("about.author.github")}
          </LinkButton>
          <LinkButton href={SITE.linkedin} icon={<ExternalIcon />}>
            {t("about.author.linkedin")}
          </LinkButton>
        </div>
        <Text size="sm" tone="muted" className="mt-6 max-w-copy">
          {t.rich("about.author.contact", answerTags(locale))}
        </Text>
      </Columns>
    </Section>
  );
}
