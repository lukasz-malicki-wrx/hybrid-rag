import { Badge } from "@hybrid-rag/ui/badge";
import { Card } from "@hybrid-rag/ui/card";
import { Heading } from "@hybrid-rag/ui/heading";
import { CheckIcon, CloudIcon, ComputerIcon, UnlimitedIcon } from "@hybrid-rag/ui/icons";
import { Text } from "@hybrid-rag/ui/text";
import { IconTile } from "@/components/ui/icon-tile";
import { LinkButton } from "@/components/ui/link-button";
import { formatCount, formatPrice, TABLE, type Plan, type RowId } from "@/config/pricing";
import { SITE } from "@/config/site";
import type { Locale } from "@/lib/i18n";
import { getTranslator } from "@/lib/translator";

const POINTS = ["setup", "scope", "terms"] as const;
const PLAN_ICONS = { free: ComputerIcon, basic: CloudIcon, unlimited: UnlimitedIcon };

/** The numbers a plan's texts may mention, formatted for the language: {documents} and {questions}. */
function limitParams(plan: Plan, locale: Locale): { documents: string; questions: string } {
  const limit = (rowId: RowId) => {
    const row = TABLE.flatMap((group) => group.rows).find((r) => r.id === rowId);
    const value = row?.kind === "limit" ? row.values[plan.id] : null;
    return value === null || value === undefined ? "" : formatCount(value, locale);
  };
  return { documents: limit("documents"), questions: limit("questions") };
}

/**
 * One plan: name, status, price, three points. Free ends in a link to the repository; a plan that
 * is only planned ends in a plain sentence, not in a button that goes nowhere.
 */
export function PlanCard({ plan, locale }: { plan: Plan; locale: Locale }) {
  const { t } = getTranslator(locale);
  const params = limitParams(plan, locale);
  const price = formatPrice(plan.monthly, locale);
  const Icon = PLAN_ICONS[plan.id];
  return (
    <Card as="li" className="flex flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <IconTile>
          <Icon width={28} height={28} />
        </IconTile>
        <Badge icon={plan.available ? <CheckIcon width={14} height={14} /> : undefined}>
          {plan.available ? t("pricing.plans.available") : t("pricing.plans.soon")}
        </Badge>
      </div>
      <Heading level={3} size="h3" className="mt-6">
        {t(`pricing.plans.${plan.id}.name`)}
      </Heading>
      <Text tone="muted" className="mt-3 sm:min-h-12">
        {t(`pricing.plans.${plan.id}.tagline`)}
      </Text>
      <Text as="div" className="mt-6 flex items-baseline gap-2">
        <Text as="span" className="sr-only">
          {t("pricing.plans.priceLabel", { price })}
        </Text>
        <Text as="span" size="stat" aria-hidden="true">
          {price}
        </Text>
        <Text as="span" size="sm" tone="muted" aria-hidden="true">
          {t("pricing.plans.perMonth")}
        </Text>
      </Text>
      <ul className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
        {POINTS.map((point) => (
          <li key={point} className="flex gap-2">
            <CheckIcon className="mt-0.5 shrink-0 text-accent" />
            <Text as="span" size="sm">
              {t(`pricing.plans.${plan.id}.points.${point}`, params)}
            </Text>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        {plan.available ? (
          <LinkButton href={SITE.repo} variant="primary" className="w-full">
            {t("pricing.plans.freeCta")}
          </LinkButton>
        ) : (
          <Text size="sm" tone="muted">
            {t("pricing.plans.soonNote")}
          </Text>
        )}
      </div>
    </Card>
  );
}
