import { Card } from "@hybrid-rag/ui/card";
import { Text } from "@hybrid-rag/ui/text";
import { CheckIcon, MinusIcon } from "@hybrid-rag/ui/icons";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatCount, PLANS, TABLE, type PlanId, type TableRow } from "@/config/pricing";
import type { Locale } from "@/lib/i18n";
import { getTranslator, type AppTranslator } from "@/lib/translator";

const CELL = "px-0.5 py-3 text-center align-middle sm:px-4";

function Cell({ row, plan, locale, t }: { row: TableRow; plan: PlanId; locale: Locale; t: AppTranslator["t"] }) {
  if (row.kind === "limit") {
    const value = row.values[plan];
    return (
      <td className={CELL}>
        {value === null ? <Text as="span" tone="muted">{t("pricing.table.noLimit")}</Text> : formatCount(value, locale)}
      </td>
    );
  }
  return (
    <td className={CELL}>
      {row.values[plan] ? (
        <>
          <CheckIcon className="mx-auto" />
          <span className="sr-only">{t("pricing.table.included")}</span>
        </>
      ) : (
        <>
          <MinusIcon className="mx-auto text-muted" />
          <span className="sr-only">{t("pricing.table.notIncluded")}</span>
        </>
      )}
    </td>
  );
}

/**
 * The plans compared in a real table: a caption, column headers, a header for every row and group.
 * It fits a 320px screen; where it cannot, only the table scrolls, inside a region the keyboard can reach.
 */
export function ComparisonTable({ locale }: { locale: Locale }) {
  const { t } = getTranslator(locale);
  return (
    <Section labelledBy="table-heading" tone="panel" spacing="tight">
      <SectionHeading id="table-heading" align="center" eyebrow={t("pricing.table.eyebrow")} title={t("pricing.table.heading")} className="mb-heading" />
      {/* The one scrollable box on the page: focusable, so a keyboard can scroll it, and named. */}
      <Card as="section" aria-label={t("pricing.table.regionLabel")} tabIndex={0} className="relative overflow-x-auto rounded-xl">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <caption className="px-2 py-3 text-left text-sm text-muted sm:px-4">{t("pricing.table.caption")}</caption>
          <thead>
            <tr className="border-t border-border bg-surface">
              <th scope="col" className="w-2/5 px-2 py-3 text-left font-medium text-muted sm:px-4">
                {t("pricing.table.feature")}
              </th>
              {PLANS.map((plan) => (
                <th key={plan.id} scope="col" className="px-0.5 py-3 text-center align-bottom font-semibold sm:px-4">
                  {t(`pricing.plans.${plan.id}.name`)}
                  <Text as="span" size="xs" tone="muted" className="mt-0.5 block font-normal">
                    {plan.available ? t("pricing.plans.available") : t("pricing.plans.soon")}
                  </Text>
                </th>
              ))}
            </tr>
          </thead>
          {TABLE.map((group) => (
            <tbody key={group.id} className="border-t border-border">
              <tr>
                <th scope="rowgroup" colSpan={PLANS.length + 1} className="bg-surface px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted sm:px-4">
                  {t(`pricing.table.groups.${group.id}`)}
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <th scope="row" className="px-2 py-3 text-left font-normal sm:px-4">
                    {t(`pricing.table.rows.${row.id}`)}
                  </th>
                  {PLANS.map((plan) => (
                    <Cell key={plan.id} row={row} plan={plan.id} locale={locale} t={t} />
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </Card>
    </Section>
  );
}
