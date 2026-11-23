import { memo, type ReactNode } from "react";
import { Heading } from "@hybrid-rag/ui/heading";

/** Title of a sidebar section (20px bold) with an optional 32px action on the right. */
export const ColumnHeader = memo(function ColumnHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex h-8 shrink-0 items-center justify-between gap-2">
      <Heading level={2} size="bar" className="min-w-0 truncate">
        {title}
      </Heading>
      {action}
    </div>
  );
});
