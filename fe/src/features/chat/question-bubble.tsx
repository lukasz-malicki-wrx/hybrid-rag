"use client";

import { memo } from "react";
import { useTranslation } from "@/i18n/use-translation";
import { QuestionFiles, type QuestionFile } from "./question-files";

export const QuestionBubble = memo(function QuestionBubble({ text, files }: { text: string; files: QuestionFile[] }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-end gap-2">
      <QuestionFiles files={files} />
      <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-surface-2 px-4 py-2">
        <span className="sr-only">{t("chat.you")} </span>
        {text}
      </p>
    </div>
  );
});
