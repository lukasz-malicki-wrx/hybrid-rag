import type { Locale } from "@/lib/i18n";
import type { AppTranslator } from "@/lib/translator";

/** What every section of the page receives: the translator and the language (for screenshots and number formats). */
export type SectionProps = { t: AppTranslator["t"]; locale: Locale };
