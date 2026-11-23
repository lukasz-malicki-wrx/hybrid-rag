"use client";

import { memo, useCallback, type ReactNode } from "react";
import { cn } from "@hybrid-rag/ui/cn";
import { FrownIcon, SmileIcon } from "@hybrid-rag/ui/icons";
import type { Rating } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";

const RatingButton = memo(function RatingButton({
  pressed,
  label,
  icon,
  onClick,
}: {
  pressed: boolean;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex size-6 cursor-pointer items-center justify-center rounded-full",
        pressed ? "bg-accent text-accent-fg" : "text-fg hover:opacity-70",
      )}
    >
      {icon}
    </button>
  );
});

/** Rates a stored answer with two toggle buttons; pressing the pressed one withdraws the rating. */
export const RatingPill = memo(function RatingPill({
  answerId,
  rating,
  onRate,
}: {
  answerId: string;
  rating: Rating | null;
  onRate: (answerId: string, rating: Rating | null) => void;
}) {
  const { t } = useTranslation();
  const rateGood = useCallback(() => onRate(answerId, rating === "up" ? null : "up"), [onRate, answerId, rating]);
  const rateBad = useCallback(() => onRate(answerId, rating === "down" ? null : "down"), [onRate, answerId, rating]);
  return (
    <div role="group" aria-label={t("chat.ratingLabel")} className="inline-flex h-6 items-center rounded-2xl bg-chip px-0.5">
      <RatingButton pressed={rating === "up"} label={t("chat.rateGood")} icon={<SmileIcon width={16} height={16} />} onClick={rateGood} />
      <RatingButton pressed={rating === "down"} label={t("chat.rateBad")} icon={<FrownIcon width={16} height={16} />} onClick={rateBad} />
    </div>
  );
});
