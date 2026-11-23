"use client";

import { useTranslation } from "@/i18n/use-translation";
import { Column } from "./column";
import { LiveTurn } from "./live-turn";
import { TurnAnnouncer } from "./turn-announcer";
import type { OpenSources } from "./use-sources-panel";

/** The column holding the answer being written before its conversation exists, with its announcement. */
export function PendingTurn({
  turnKey,
  shown,
  onOpenSources,
  className,
}: {
  turnKey: string | null;
  shown: boolean;
  onOpenSources: OpenSources;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <>
      {shown && turnKey && (
        <Column as="ol" aria-label={t("chat.messages")} className={className}>
          <LiveTurn turnKey={turnKey} onOpenSources={onOpenSources} />
        </Column>
      )}
      <TurnAnnouncer turnKey={turnKey} active={shown} />
    </>
  );
}
