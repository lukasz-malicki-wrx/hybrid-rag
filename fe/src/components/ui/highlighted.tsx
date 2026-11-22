import { memo } from "react";
import { splitMatches } from "@/lib/highlight";

/** Text with every occurrence of `needle` marked (case-insensitive), so it is easy to spot. */
export const Highlighted = memo(function Highlighted({ text, needle }: { text: string; needle: string }) {
  return (
    <>
      {splitMatches(text, needle).map((part, i) =>
        part.match ? (
          <mark key={i} // A highlighter yellow with dark text in both themes: it must stand out from any palette.
          className="rounded-sm bg-[light-dark(#ffe14d,#f2c200)] px-0.5 font-semibold text-[#1a1a1a] box-decoration-clone shadow-[0_0_0_1px_light-dark(#e0b800,#b88f00)]">
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </>
  );
});
