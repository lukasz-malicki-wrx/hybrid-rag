import type { HTMLAttributes } from "react";
import { cn } from "@hybrid-rag/ui/cn";

/** Centres content at the page width (1200px of content) and keeps the side gutters: the one place that sets it. */
export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-page px-gutter", className)} {...props} />;
}
