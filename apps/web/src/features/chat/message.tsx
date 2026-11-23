"use client";

import { memo, type ReactNode } from "react";
import { cn } from "@hybrid-rag/ui/cn";
import { SparklesIcon, UserIcon } from "@hybrid-rag/ui/icons";
import { useTranslation } from "@/i18n/use-translation";
import type { When } from "@/lib/format";
import { MESSAGE_INSET } from "./column";

/**
 * One side of a turn: a 32px avatar, the author and time on the line above, and the bubble
 * 16px to the right, tucked under the avatar. `live` is a message with no server time yet.
 */
export const Message = memo(function Message({
  role,
  time,
  live,
  children,
}: {
  role: "user" | "assistant";
  /** When it was written (the server's ISO time, or the moment a live question was sent); omitted, nothing is shown unless `live`. */
  time?: When;
  live?: boolean;
  children: ReactNode;
}) {
  const { t, clockTime } = useTranslation();
  const user = role === "user";
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-0 z-10 flex size-8 items-center justify-center rounded-lg",
          user ? "bg-chip text-fg" : "bg-accent text-accent-fg",
        )}
      >
        {user ? <UserIcon /> : <SparklesIcon />}
      </span>
      <div className="flex h-4 items-center gap-2 pl-10 text-xs leading-4">
        <span className="font-semibold">{t(user ? "chat.authorYou" : "chat.authorResponse")}</span>
        {time ? (
          <time dateTime={new Date(time).toISOString()} className="text-muted">
            {clockTime(time)}
          </time>
        ) : (
          live && <span className="text-muted">{t("time.justNow")}</span>
        )}
      </div>
      {children}
    </div>
  );
});

/** The answer's bubble: full width, `bubble-ai`, text 14px/1.6. */
export function AnswerBubble({ busy, children }: { busy?: boolean; children: ReactNode }) {
  return (
    <div aria-busy={busy} className={cn(MESSAGE_INSET, "min-w-0 break-words rounded-lg bg-bubble-ai px-4 py-4 text-sm leading-[1.6] sm:px-6 sm:py-5")}>
      {children}
    </div>
  );
}
