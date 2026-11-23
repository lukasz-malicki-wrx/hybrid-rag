import type { Locale } from "@/lib/i18n";

/** How a number is written in a text. */
type Kind = "integer" | "decimal1" | "decimal3" | "percent";

type Fact = { value: number; kind: Kind };

/**
 * The numbers the texts quote, from the app's code and its evaluation (docs/EVALUATION.md). They are
 * placeholders in the messages (`{evalQuestions}`) and are written by `factParams` with the
 * number format of the reader's language ("0.5" and "0,5"), so a figure changes in one place.
 */
const FACT_LIST = {
  // The evaluation: four public documents, questions about them and off-topic ones.
  evalQuestions: { value: 44, kind: "integer" },
  evalDocuments: { value: 4, kind: "integer" },
  evalAnswerable: { value: 34, kind: "integer" },
  evalOffTopic: { value: 10, kind: "integer" },
  evalPolish: { value: 4, kind: "integer" },
  vectorTop10: { value: 0.91, kind: "percent" },
  // Hybrid search: the answerable questions with the right passage in the top 10, the off-topic ones that returned
  // nothing, and the passages (chunks) the four documents were cut into.
  hybridTop10: { value: 1, kind: "percent" },
  evalOffTopicRefused: { value: 10, kind: "integer" },
  evalPassages: { value: 122, kind: "integer" },
  // Distances measured in the evaluation, and the gate's threshold between them.
  nearestAnswerable: { value: 0.474, kind: "decimal3" },
  exactTermsNear: { value: 0.552, kind: "decimal3" },
  exactTermsFar: { value: 0.657, kind: "decimal3" },
  nearestOffTopic: { value: 0.524, kind: "decimal3" },
  gateDistance: { value: 0.5, kind: "decimal1" },
  // The pipeline (apps/api): chunking, search, the prompt.
  chunkChars: { value: 1800, kind: "integer" },
  chunkOverlap: { value: 200, kind: "integer" },
  vectorSize: { value: 1024, kind: "integer" },
  candidates: { value: 50, kind: "integer" },
  topChunks: { value: 6, kind: "integer" },
  historyTurns: { value: 3, kind: "integer" },
  contextTokens: { value: 8192, kind: "integer" },
  retryFirstSeconds: { value: 30, kind: "integer" },
  retrySecondMinutes: { value: 2, kind: "integer" },
  // The app's limits and the cost of running it.
  favouritesLimit: { value: 10, kind: "integer" },
  uploadMb: { value: 50, kind: "integer" },
  seedWaitMinutes: { value: 10, kind: "integer" },
  indexPages: { value: 29, kind: "integer" },
  indexMinutes: { value: 8, kind: "integer" },
  embeddingGb: { value: 1.2, kind: "decimal1" },
  chatGb: { value: 1.9, kind: "decimal1" },
  diskGb: { value: 4, kind: "integer" },
  ramGb: { value: 8, kind: "integer" },
} as const satisfies Record<string, Fact>;

type FactId = keyof typeof FACT_LIST;
type FactParams = Record<FactId, string>;

const OPTIONS: Record<Kind, Intl.NumberFormatOptions> = {
  integer: { maximumFractionDigits: 0 },
  decimal1: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
  decimal3: { minimumFractionDigits: 3, maximumFractionDigits: 3 },
  percent: { style: "percent", maximumFractionDigits: 0 },
};

/** The raw number of a fact, for the places that compute with it or show it as a figure. */
export function factValue(id: FactId): number {
  return FACT_LIST[id].value;
}

/** Every fact as a text in the number format of `locale`: pass it as the parameters of `t(...)`. */
export function factParams(locale: Locale): FactParams {
  const formats = Object.fromEntries(
    (Object.keys(OPTIONS) as Kind[]).map((kind) => [kind, new Intl.NumberFormat(locale, OPTIONS[kind])]),
  ) as Record<Kind, Intl.NumberFormat>;
  const entries = (Object.keys(FACT_LIST) as FactId[]).map((id) => [id, formats[FACT_LIST[id].kind].format(FACT_LIST[id].value)]);
  return Object.fromEntries(entries) as FactParams;
}
