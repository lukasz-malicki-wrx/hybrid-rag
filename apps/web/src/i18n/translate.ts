import { createTranslator as create, type Params, type Translator as CoreTranslator } from "@hybrid-rag/i18n";
import type { Locale } from "./config";
import { MESSAGES, type MessageKey, type PluralKey } from "./messages";

export type { Params };
export type Translator = CoreTranslator<Locale, MessageKey, PluralKey>;

export function createTranslator(locale: Locale): Translator {
  return create(locale, MESSAGES[locale]);
}
