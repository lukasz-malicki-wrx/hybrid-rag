import { cn } from "@hybrid-rag/ui/cn";

/**
 * Three hand-drawn strokes in the decoration colour (64px), marking a corner of a picture: it sits
 * partly outside the corner, as in the design. Decoration
 * only: hidden from assistive technology, no text, drawn with `currentColor` (flip it with a
 * transform class to mark another corner).
 */
export function Doodle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      className={cn("size-16 text-ai", className)}
    >
      <path d="M6 24 18 30M16 8 24 20M34 4 36 18" />
    </svg>
  );
}
