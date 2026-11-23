import { Heading } from "@hybrid-rag/ui/heading";
import { Columns } from "@/components/ui/columns";
import { Container } from "@/components/ui/container";
import { TextLink } from "@/components/ui/text-link";
import type { Locale } from "@/lib/i18n";
import { messageParams } from "@/lib/message-params";
import { getTranslator } from "@/lib/translator";
import { answerTags } from "@/components/rich-tags";
import { FaqList } from "./faq-list";
import { FAQ_GROUPS } from "./faq-data";

/** The questions: a column of the groups (it stays in view) beside the lists, one list with its own heading per group. */
export function FaqGroups({ locale }: { locale: Locale }) {
  const { t } = getTranslator(locale);
  const tags = answerTags(locale);
  const params = messageParams(t, locale);
  return (
    <div className="py-section">
      <Container>
      <Columns
        widths="narrow"
        aside={
          <nav aria-labelledby="faq-groups" className="lg:sticky lg:top-6">
            <Heading id="faq-groups" level={2} size="overline" className="text-muted">
              {t("faq.groupsLabel")}
            </Heading>
            <ol className="mt-3 flex flex-wrap gap-x-5 gap-y-1 lg:flex-col lg:gap-x-0">
              {FAQ_GROUPS.map((group) => (
                <li key={group.id}>
                  <TextLink href={`#faq-${group.id}`} variant="quiet">
                    {t(`faq.groups.${group.id}`)}
                  </TextLink>
                </li>
              ))}
            </ol>
          </nav>
        }
      >
        <div className="flex flex-col gap-12">
          {FAQ_GROUPS.map((group) => (
            <section key={group.id} id={`faq-${group.id}`} aria-labelledby={`faq-group-${group.id}`} className="scroll-mt-6">
              <Heading id={`faq-group-${group.id}`} level={3} size="h3" className="mb-4">
                {t(`faq.groups.${group.id}`)}
              </Heading>
              <FaqList
                items={group.items.map((id) => ({
                  id,
                  question: t(`faq.items.${id}.q`),
                  answer: t.rich(`faq.items.${id}.a`, tags, params),
                }))}
              />
            </section>
          ))}
        </div>
      </Columns>
      </Container>
    </div>
  );
}
