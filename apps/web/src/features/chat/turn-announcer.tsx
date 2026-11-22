"use client";

import { useTranslation } from "@/i18n/use-translation";
import { useChatStore } from "@/stores/chat-store";

/** Screen-reader announcement when the live answer finishes (the tokens themselves are not read). */
export function TurnAnnouncer({ turnKey, active }: { turnKey: string | null; active: boolean }) {
  const { t } = useTranslation();
  const status = useChatStore((s) => (turnKey ? s.turns[turnKey]?.status : undefined));
  const refused = useChatStore((s) => (turnKey ? s.turns[turnKey]?.refused : undefined));
  const error = useChatStore((s) => (turnKey ? s.turns[turnKey]?.error : undefined));

  let text = "";
  if (active && status === "done") text = t(refused ? "chat.announceNotFound" : "chat.announceReady");
  if (active && status === "stopped") text = t("chat.announceStopped");
  if (active && status === "error") text = t("chat.announceError", { message: error ?? t("errors.generic") });

  return (
    <p className="sr-only" aria-live="polite">
      {text}
    </p>
  );
}
