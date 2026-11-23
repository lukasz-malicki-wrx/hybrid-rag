import type { ReactNode } from "react";
import { cn } from "@hybrid-rag/ui/cn";

type ColumnsProps = {
  /** The first column: a section's heading, or a navigation. */
  aside: ReactNode;
  /** The second column: the content. */
  children: ReactNode;
  /** "half": two equal columns (540px each at the design width, 120px apart). "narrow": a narrow first column and a wide second one, for a heading beside a list or a text. */
  widths?: "half" | "narrow";
  className?: string;
};

/** Two columns from the large breakpoint up, one under the other on a phone: a heading beside what it introduces. */
export function Columns({ aside, children, widths = "half", className }: ColumnsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-10 lg:gap-x-16 xl:gap-x-30",
        widths === "half" ? "lg:grid-cols-2" : "lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]",
        className,
      )}
    >
      <div className="min-w-0">{aside}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
