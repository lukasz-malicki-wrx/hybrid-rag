import type { Locale } from "@/lib/i18n";
import type { AppTranslator } from "@/lib/translator";

/** What every section of the home page needs: the translator and the language (for links and screenshots). */
export type HomeSectionProps = { t: AppTranslator["t"]; locale: Locale };
