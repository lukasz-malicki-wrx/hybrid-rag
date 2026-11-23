import { RepoIcon } from "@hybrid-rag/ui/icons";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Columns } from "@/components/ui/columns";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/config/site";
import type { SectionProps } from "./section-props";

const DOCS = ["readme", "howItWorks", "evaluation"] as const;

/** Links to the deeper documents in the repository. */
export function More({ t }: SectionProps) {
  return (
    <Section labelledBy="hiw-more">
      <Columns widths="narrow" aside={<SectionHeading id="hiw-more" eyebrow={t("howItWorks.more.eyebrow")} title={t("howItWorks.more.title")} lead={t("howItWorks.more.lead")} />}>
        <ul className="flex flex-col gap-2">
          {DOCS.map((doc) => (
            <li key={doc}>
              <ArrowLink href={SITE.docs[doc]}>{t(`howItWorks.more.${doc}`)}</ArrowLink>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <LinkButton href={SITE.repo} variant="primary" icon={<RepoIcon />}>
            {t("howItWorks.more.github")}
          </LinkButton>
        </div>
      </Columns>
    </Section>
  );
}
