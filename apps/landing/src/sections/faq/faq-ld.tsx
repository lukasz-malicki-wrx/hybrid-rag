import { JsonLd } from "@/components/ui/json-ld";
import type { Locale } from "@/lib/i18n";
import { messageParams } from "@/lib/message-params";
import { getTranslator } from "@/lib/translator";
import { FAQ_GROUPS, plainText } from "./faq-data";

/** FAQPage structured data, built from the same translations as the page, as plain text. */
export function FaqLd({ locale }: { locale: Locale }) {
  const { t } = getTranslator(locale);
  const params = messageParams(t, locale);
  return (
    <JsonLd
      data={{
        "@type": "FAQPage",
        inLanguage: locale,
        mainEntity: FAQ_GROUPS.flatMap((group) => group.items).map((id) => ({
          "@type": "Question",
          name: plainText(t(`faq.items.${id}.q`)),
          acceptedAnswer: { "@type": "Answer", text: plainText(t(`faq.items.${id}.a`, params)) },
        })),
      }}
    />
  );
}
