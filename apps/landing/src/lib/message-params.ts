import type { Params } from "@hybrid-rag/i18n";
import { factParams } from "@/config/facts";
import type { Locale } from "./i18n";
import type { AppTranslator } from "./translator";

/**
 * The parameters of the texts that quote numbers or say what is sent to Anthropic: every figure of
 * `config/facts.ts` in the reader's number format, and `sent`, the one statement of what the
 * prompt holds. Pass it to `t` and `t.rich`: a text takes the placeholders it has and ignores the rest.
 */
export function messageParams(t: AppTranslator["t"], locale: Locale): Params {
  const facts = factParams(locale);
  return { ...facts, sent: t("privacy.app.claude.sent", facts) };
}
