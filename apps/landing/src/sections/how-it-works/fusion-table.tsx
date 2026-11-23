import { Card } from "@hybrid-rag/ui/card";
import { cn } from "@hybrid-rag/ui/cn";
import type { Locale } from "@/lib/i18n";
import type { AppTranslator } from "@/lib/translator";
import type { FusedChunk } from "./fusion";

/** The dash of a chunk that is not in a list. It is a sign, not a word, and the same in every language. */
const ABSENT_SIGN = "–";

const CELL = "px-2 py-2.5 text-left align-middle min-[400px]:px-3 sm:px-4";

function Position({ value, absentLabel }: { value: number | null; absentLabel: string }) {
  if (value !== null) return <>{value}</>;
  return (
    <>
      <span aria-hidden="true">{ABSENT_SIGN}</span>
      <span className="sr-only">{absentLabel}</span>
    </>
  );
}

/**
 * The worked example of rank fusion as a table: each chunk's position in the two lists, its points
 * and its place. The bar under the points is decoration; the numbers carry the information.
 */
export function FusionTable({ rows, locale, t }: { rows: readonly FusedChunk[]; locale: Locale; t: AppTranslator["t"] }) {
  const format = new Intl.NumberFormat(locale, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  const best = Math.max(...rows.map((row) => row.points));
  const absent = t("howItWorks.search.fusion.table.absent");
  return (
    // Scrolls sideways when large text leaves no room for five columns: focusable and named, so a keyboard can scroll it.
    <Card as="section" aria-label={t("howItWorks.search.fusion.table.regionLabel")} tabIndex={0} className="overflow-x-auto">
      <table className="w-full table-auto border-collapse text-sm tabular-nums sm:text-base">
        <caption className="px-2 pb-1 pt-4 text-left text-sm text-muted sm:px-4">{t("howItWorks.search.fusion.table.caption")}</caption>
        <thead>
          <tr className="border-b border-border text-sm text-muted">
            <th scope="col" className={cn(CELL, "font-medium")}>
              <span className="sr-only">{t("howItWorks.search.fusion.table.chunk")}</span>
            </th>
            <th scope="col" className={cn(CELL, "font-medium")}>{t("howItWorks.search.fusion.table.meaning")}</th>
            <th scope="col" className={cn(CELL, "font-medium")}>{t("howItWorks.search.fusion.table.words")}</th>
            <th scope="col" className={cn(CELL, "font-medium")}>{t("howItWorks.search.fusion.table.points")}</th>
            <th scope="col" className={cn(CELL, "font-medium")}>{t("howItWorks.search.fusion.table.place")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-border last:border-b-0">
              <th scope="row" className={cn(CELL, "font-semibold")}>{row.name}</th>
              <td className={CELL}><Position value={row.meaning} absentLabel={absent} /></td>
              <td className={CELL}><Position value={row.words} absentLabel={absent} /></td>
              <td className={CELL}>
                {format.format(row.points)}
                <span aria-hidden="true" className="mt-1 block h-1 rounded-full bg-accent" style={{ width: `${(row.points / best) * 100}%` }} />
              </td>
              <td className={cn(CELL, row.place === 1 && "font-semibold")}>{row.place}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
