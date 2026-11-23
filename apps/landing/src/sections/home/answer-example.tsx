import type { ReactNode } from "react";
import { Badge } from "@hybrid-rag/ui/badge";
import { Card } from "@hybrid-rag/ui/card";
import { Heading } from "@hybrid-rag/ui/heading";
import { Text } from "@hybrid-rag/ui/text";
import { IconTile } from "@/components/ui/icon-tile";

type AnswerExampleProps = {
  /** An icon in the tile where a person's photo would be. */
  icon: ReactNode;
  questionLabel: string;
  question: string;
  /** The answer. */
  children: ReactNode;
  /** Where it comes from (or that nothing was found), with its icon. */
  source: { icon: ReactNode; text: ReactNode };
  badge: { tone: "neutral" | "warn"; text: string };
};

/**
 * One example answer: the question in a bar beside an 80px icon tile, the answer, and under a line its source and a
 * badge. The card spans three rows of the list's grid (subgrid), so beside another card the bars, the answers and the
 * sources line up whatever the length of the questions.
 */
export function AnswerExample({ icon, questionLabel, question, children, source, badge }: AnswerExampleProps) {
  return (
    <Card as="li" className="row-span-3 grid grid-rows-subgrid gap-y-6 p-6 max-lg:mb-6 max-lg:last:mb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <IconTile size="lg" className="sm:self-center">{icon}</IconTile>
        <div className="flex min-h-20 min-w-0 flex-col justify-center rounded-lg bg-surface-2 px-4 py-3 sm:flex-1">
          <Text size="xs" tone="muted">
            {questionLabel}
          </Text>
          <Heading level={3} size="title" className="mt-1">
            {question}
          </Heading>
        </div>
      </div>
      <Text>{children}</Text>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border pt-4">
        <Text as="div" size="sm" tone="muted" className="flex items-center gap-2">
          {source.icon}
          {source.text}
        </Text>
        <Badge tone={badge.tone}>{badge.text}</Badge>
      </div>
    </Card>
  );
}
