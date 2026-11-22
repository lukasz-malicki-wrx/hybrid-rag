import { memo } from "react";
import { splitMatches } from "@/lib/highlight";

/** Text with every occurrence of `needle` marked (case-insensitive), so it is easy to spot. */
export const Highlighted = memo(function Highlighted({ text, needle }: { text: string; needle: string }) {
  return (
    <>
      {splitMatches(text, needle).map((part, i) =>
        part.match ? (
          <mark key={i} className="rounded-sm bg-warn-bg px-0.5 text-warn-fg">
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </>
  );
});
