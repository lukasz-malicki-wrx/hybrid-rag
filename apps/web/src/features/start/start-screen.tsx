"use client";

import { AlertIcon, ArrowRightIcon, BoltIcon, ChatIcon } from "@hybrid-rag/ui/icons";
import { cn } from "@hybrid-rag/ui/cn";
import { Heading } from "@hybrid-rag/ui/heading";
import { Text } from "@hybrid-rag/ui/text";
import { useTranslation } from "@/i18n/use-translation";
import { StartCard, TILE } from "./start-card";

const EXAMPLES = ["start.example1", "start.example2", "start.example3"] as const;
const CAPABILITIES = ["start.capability1", "start.capability2", "start.capability3"] as const;
const LIMITATIONS = ["start.limitation1", "start.limitation2", "start.limitation3"] as const;

/**
 * What the empty chat shows: what to ask, what the assistant does and where it stops. The
 * examples put their text in the message box (the caller decides how); nothing is sent.
 */
export function StartScreen({ onExample }: { onExample: (text: string) => void }) {
  const { t } = useTranslation();
  return (
    <div className="@container mx-auto w-full max-w-[736px] px-4 py-8 text-center">
      <Heading level={2} size="title">
        {t("start.title")}
      </Heading>
      <Text size="xs" tone="muted" className="mx-auto mt-2 max-w-md">
        {t("start.intro")}
      </Text>
      <div className="mt-8 grid gap-4 text-left @2xl:grid-cols-3">
        <StartCard icon={<ChatIcon className="text-accent" />} title={t("start.examples")}>
          <ul className="space-y-3">
            {EXAMPLES.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onExample(t(key))}
                  className={cn(
                    TILE,
                    "cursor-pointer justify-between gap-2 text-left hover:bg-chip",
                  )}
                >
                  <span>{t(key)}</span>
                  <ArrowRightIcon width={14} height={14} className="shrink-0 text-accent" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </StartCard>
        <StartCard icon={<BoltIcon className="text-accent" />} title={t("start.capabilities")}>
          <ul className="space-y-3">
            {CAPABILITIES.map((key) => (
              <li key={key} className={TILE}>
                {t(key)}
              </li>
            ))}
          </ul>
        </StartCard>
        <StartCard icon={<AlertIcon className="text-danger" />} title={t("start.limitations")}>
          <ul className="space-y-3">
            {LIMITATIONS.map((key) => (
              <li key={key} className={TILE}>
                {t(key)}
              </li>
            ))}
          </ul>
        </StartCard>
      </div>
    </div>
  );
}
