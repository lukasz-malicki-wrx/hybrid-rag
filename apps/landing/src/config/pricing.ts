/**
 * The plans of the pricing page, as data. It is a mock: the app has no payments, accounts or hosted
 * service, so only Free exists. Names, descriptions and every other text are in messages/*\/pricing.json.
 */
export const PLAN_IDS = ["free", "basic", "unlimited"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

const CURRENCY = "EUR";

export type Plan = {
  id: PlanId;
  /** Price per month in `CURRENCY`, a whole number. */
  monthly: number;
  /** Only an available plan can be used today; the others are planned. */
  available: boolean;
};

export const PLANS: readonly Plan[] = [
  { id: "free", monthly: 0, available: true },
  { id: "basic", monthly: 9, available: false },
  { id: "unlimited", monthly: 29, available: false },
];

/** A limit: a number, or `null` for "the app sets none" (self-hosted, so your hardware does). */
type Limit = number | null;

/** Ids of the groups and rows: the keys of `pricing.table.groups` and `pricing.table.rows`. */
type GroupId = "run" | "limits" | "included" | "support";
export type RowId =
  | "selfHosted"
  | "hosted"
  | "localData"
  | "documents"
  | "questions"
  | "citations"
  | "relevanceGate"
  | "groups"
  | "languages"
  | "community"
  | "priority";

export type TableRow =
  | { id: RowId; kind: "flag"; values: Record<PlanId, boolean> }
  | { id: RowId; kind: "limit"; values: Record<PlanId, Limit> };

type TableGroup = { id: GroupId; rows: readonly TableRow[] };

const all = (value: boolean): Record<PlanId, boolean> => ({ free: value, basic: value, unlimited: value });

/** The comparison table. The Basic and Unlimited columns describe plans that do not exist yet. */
export const TABLE: readonly TableGroup[] = [
  {
    id: "run",
    rows: [
      { id: "selfHosted", kind: "flag", values: { free: true, basic: false, unlimited: false } },
      { id: "hosted", kind: "flag", values: { free: false, basic: true, unlimited: true } },
      { id: "localData", kind: "flag", values: { free: true, basic: false, unlimited: false } },
    ],
  },
  {
    id: "limits",
    rows: [
      { id: "documents", kind: "limit", values: { free: null, basic: 100, unlimited: null } },
      { id: "questions", kind: "limit", values: { free: null, basic: 500, unlimited: null } },
    ],
  },
  {
    id: "included",
    rows: [
      { id: "citations", kind: "flag", values: all(true) },
      { id: "relevanceGate", kind: "flag", values: all(true) },
      { id: "groups", kind: "flag", values: all(true) },
      { id: "languages", kind: "flag", values: all(true) },
    ],
  },
  {
    id: "support",
    rows: [
      { id: "community", kind: "flag", values: all(true) },
      { id: "priority", kind: "flag", values: { free: false, basic: false, unlimited: true } },
    ],
  },
];

/** "€9" in English, "9 €" in Polish: the amount in the money format of the locale. */
export function formatPrice(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 }).format(amount);
}

export function formatCount(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(amount);
}
