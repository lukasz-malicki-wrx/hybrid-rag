"use client";

import { memo } from "react";
import { cn } from "@hybrid-rag/ui/cn";
import { MESSAGE_INSET } from "./column";
import { QuestionFiles, type QuestionFile } from "./question-files";
import { isShortQuestion } from "./turns";

/** The question, as wide as its text: round when short, squarer when long or on several lines. */
export const QuestionBubble = memo(function QuestionBubble({ text, files }: { text: string; files: QuestionFile[] }) {
  return (
    <div className={cn(MESSAGE_INSET, "flex flex-col items-start gap-2")}>
      <p
        className={cn(
          "w-fit max-w-full whitespace-pre-wrap break-words bg-bubble-user px-[22px] py-3 text-sm leading-[1.6]",
          isShortQuestion(text) ? "rounded-2xl" : "rounded-lg",
        )}
      >
        {text}
      </p>
      <QuestionFiles files={files} />
    </div>
  );
});
