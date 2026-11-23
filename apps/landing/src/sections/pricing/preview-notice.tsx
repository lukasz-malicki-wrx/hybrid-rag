import { Card } from "@hybrid-rag/ui/card";
import { AlertIcon } from "@hybrid-rag/ui/icons";
import { Text } from "@hybrid-rag/ui/text";
import type { AppTranslator } from "@/lib/translator";

/** Says before any price that nothing can be bought. */
export function PreviewNotice({ t }: { t: AppTranslator["t"] }) {
  return (
    <Card className="mx-auto mb-10 flex max-w-copy gap-3 border-l-4 border-l-warn-fg p-4 sm:p-5">
      <AlertIcon className="mt-1 shrink-0 text-warn-fg" />
      <div>
        <Text className="font-semibold">{t("pricing.notice.lead")}</Text>
        <Text size="sm" tone="muted" className="mt-1">
          {t("pricing.notice.detail")}
        </Text>
      </div>
    </Card>
  );
}
