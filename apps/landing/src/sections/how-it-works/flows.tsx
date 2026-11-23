import { ChatIcon, CheckIcon, FileIcon, AlertIcon, SearchIcon, SparklesIcon, BoltIcon, RefreshIcon } from "@hybrid-rag/ui/icons";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { factParams } from "@/config/facts";
import { FlowDiagram, type FlowStep } from "./flow-diagram";
import type { SectionProps } from "./section-props";

const INGEST = ["upload", "cut", "embed", "store"] as const;
const ASK = ["question", "search", "merge", "gate", "write", "save"] as const;

const INGEST_ICONS = { upload: FileIcon, cut: SearchIcon, embed: BoltIcon, store: CheckIcon };
const ASK_ICONS = { question: ChatIcon, search: SearchIcon, merge: RefreshIcon, gate: AlertIcon, write: SparklesIcon, save: CheckIcon };

/** The two flows of the app as diagrams, before the detail: the picture to keep in mind while reading on. */
export function Flows({ t, locale }: SectionProps) {
  const facts = factParams(locale);
  const label = (number: number) => t("howItWorks.flows.stepLabel", { number: String(number) });
  const ingest: FlowStep[] = INGEST.map((id, index) => ({
    id,
    title: t(`howItWorks.flows.ingest.steps.${id}.title`),
    text: t(`howItWorks.flows.ingest.steps.${id}.text`, facts),
    stepLabel: label(index + 1),
    Icon: INGEST_ICONS[id],
  }));
  const ask: FlowStep[] = ASK.map((id, index) => ({
    id,
    title: t(`howItWorks.flows.ask.steps.${id}.title`),
    text: t(`howItWorks.flows.ask.steps.${id}.text`, facts),
    stepLabel: label(index + 1),
    Icon: ASK_ICONS[id],
  }));
  return (
    <Section labelledBy="hiw-flows">
      <SectionHeading id="hiw-flows" align="center" eyebrow={t("howItWorks.flows.eyebrow")} title={t("howItWorks.flows.title")} lead={t("howItWorks.flows.lead")} className="mb-heading" />
      <div className="flex flex-col gap-14">
        <FlowDiagram label={t("howItWorks.flows.ingest.label")} steps={ingest} />
        <FlowDiagram label={t("howItWorks.flows.ask.label")} steps={ask} />
      </div>
    </Section>
  );
}
