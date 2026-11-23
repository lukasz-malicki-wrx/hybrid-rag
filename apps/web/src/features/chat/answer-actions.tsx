import { memo, type ReactNode } from "react";

/**
 * The row under a finished answer. Only the layout: the buttons that go in it (RatingPill,
 * SourcesButton, RegenerateButton, CopyButton) are the caller's to choose, so a turn without
 * a stored answer does not have to pass dummies for the ones it lacks.
 */
export const AnswerActions = memo(function AnswerActions({ children }: { children: ReactNode }) {
  return <div className="mt-4 flex flex-wrap items-center gap-2">{children}</div>;
});

/** The buttons pushed to the right end of the row. */
export const AnswerActionsEnd = memo(function AnswerActionsEnd({ children }: { children: ReactNode }) {
  return <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>;
});
