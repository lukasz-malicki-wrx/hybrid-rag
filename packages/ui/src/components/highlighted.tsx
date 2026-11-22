import { memo } from "react";
import { splitMatches } from "../lib/highlight";

const MARK = "rounded-sm bg-mark px-0.5 text-mark-fg box-decoration-clone";

/** Text with every occurrence of `needle` marked (case-insensitive), so it is easy to spot. */
export const Highlighted = memo(function Highlighted({ text, needle }: { text: string; needle: string }) {
  return (
    <>
      {splitMatches(text, needle).map((part, i) =>
        part.match ? (
          <mark key={i} className={MARK}>
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </>
  );
});
