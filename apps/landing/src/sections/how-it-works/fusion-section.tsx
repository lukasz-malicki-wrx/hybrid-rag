import { Card } from "@hybrid-rag/ui/card";
import { Heading } from "@hybrid-rag/ui/heading";
import { Text } from "@hybrid-rag/ui/text";
import { Screenshot } from "@/components/screenshot";
import { Section } from "@/components/ui/section";
import { SplitSection } from "@/components/ui/split-section";
import { EXAMPLE_CHUNKS, fuse, RRF_K, rrfPoints } from "./fusion";
import { FusionTable } from "./fusion-table";
import type { SectionProps } from "./section-props";

/** Hybrid search, part two: how the two lists become one (rank fusion), with a worked example and the search lab. */
export function Fusion({ t, locale }: SectionProps) {
  const rows = fuse(EXAMPLE_CHUNKS);
  const first = rows[0];
  const number = new Intl.NumberFormat(locale, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return (
    <Section labelledBy="hiw-fusion" tone="panel">
      <SplitSection
        align="top"
        side="right"
        media={
          <>
            <Screenshot id="search-lab" locale={locale} sizes="(min-width: 1152px) 540px, 100vw" />
            <Text size="sm" tone="muted" className="border-t border-border p-4">
              {t("howItWorks.search.caption")}
            </Text>
          </>
        }
      >
        <Heading id="hiw-fusion" level={2} size="h2">
          {t("howItWorks.search.fusion.title")}
        </Heading>
        <Text size="lead" tone="muted" className="mt-4">
          {t("howItWorks.search.fusion.text")}
        </Text>
        <Text size="sm" tone="muted" className="mt-6 font-medium">
          {t("howItWorks.search.fusion.formulaLabel")}
        </Text>
        <Card className="mt-1.5 px-4 py-3">
          <Text className="text-lg font-semibold tabular-nums">{t("howItWorks.search.fusion.formula", { k: String(RRF_K) })}</Text>
        </Card>
        <Text className="mt-6">{t("howItWorks.search.fusion.traceable")}</Text>
      </SplitSection>

      <div className="mt-section grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-30">
        <div>
          <Heading level={3} size="h3">
            {t("howItWorks.search.fusion.exampleTitle")}
          </Heading>
          <Text className="mt-4">{t("howItWorks.search.fusion.exampleText")}</Text>
          <Text className="mt-4">{t("howItWorks.search.fusion.reading")}</Text>
          {first ? (
            <Text size="sm" tone="muted" className="mt-4 tabular-nums">
              {t("howItWorks.search.fusion.firstRow", {
                meaning: String(first.meaning),
                words: String(first.words),
                left: number.format(rrfPoints(first.meaning)),
                right: number.format(rrfPoints(first.words)),
                total: number.format(first.points),
              })}
            </Text>
          ) : null}
        </div>
        <FusionTable rows={rows} locale={locale} t={t} />
      </div>
    </Section>
  );
}
