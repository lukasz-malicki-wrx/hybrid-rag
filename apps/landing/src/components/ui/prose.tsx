import type { HTMLAttributes } from "react";
import { cn } from "@hybrid-rag/ui/cn";

/**
 * Long-form text (policy, statement): sets the rhythm, the measure, lists and code. Use the shared
 * `Heading` (level 2, size "h2") and `TextLink` inside; they bring their own look. See `.prose-copy`.
 */
export function Prose({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("prose-copy", className)} {...props} />;
}
