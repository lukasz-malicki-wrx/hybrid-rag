import { createTranslator, type Translator } from "@hybrid-rag/i18n";
import { MESSAGES, type MessageKey, type PluralKey } from "@/messages";
import type { Locale } from "./i18n";
import { keepEmailTogether, mapTexts, polishTypography } from "./typography";

export type { MessageKey, PluralKey };
/** The translator of this site: `t`, `tp` (plurals) and `t.rich`-style `rich`, keys typed from messages/en. */
export type AppTranslator = Translator<Locale, MessageKey, PluralKey>;

const cache = new Map<Locale, AppTranslator>();

/**
 * The translator of one language, for server components (`const { t } = getTranslator(locale)`).
 * Catalogs stay on the server: a client component gets the few strings it needs as props.
 */
export function getTranslator(locale: Locale): AppTranslator {
  let translator = cache.get(locale);
  if (!translator) {
    // Non-breaking spaces and hyphens are put in here, once, so the catalogs stay plain text. The
    // metadata (titles and descriptions of search results) is left as written.
    const transform = locale === "pl" ? polishTypography : keepEmailTogether;
    const messages = mapTexts(MESSAGES[locale], transform, ["meta"]) as typeof MESSAGES.pl;
    translator = createTranslator(locale, messages);
    cache.set(locale, translator);
  }
  return translator;
}
