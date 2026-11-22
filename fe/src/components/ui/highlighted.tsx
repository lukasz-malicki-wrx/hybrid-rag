import { memo } from "react";
import { splitMatches } from "@/lib/highlight";

// A soft marker colour that stays readable on any palette, in both themes.
const MARK = "rounded-sm bg-[light-dark(#fbeb9a,#6f5c14)] px-0.5 text-[light-dark(#1a1a1a,#fff6d6)] box-decoration-clone";

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
