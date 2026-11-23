import { Text } from "@hybrid-rag/ui/text";
import { formatDate } from "@/lib/format-date";
import type { Locale } from "@/lib/i18n";
import type { AppTranslator, MessageKey } from "@/lib/translator";

type UpdatedOnProps = {
  t: AppTranslator["t"];
  /** A text like "Last updated: <time>{date}</time>": the date goes in the tags. */
  messageKey: MessageKey;
  /** The date as "2026-11-22". */
  isoDate: string;
  locale: Locale;
};

/** A dated line under the title of a legal page, with the date in a machine-readable <time>. */
export function UpdatedOn({ t, messageKey, isoDate, locale }: UpdatedOnProps) {
  return (
    <Text size="sm" tone="muted">
      {t.rich(messageKey, { time: (date) => <time dateTime={isoDate}>{date}</time> }, { date: formatDate(isoDate, locale) })}
    </Text>
  );
}
