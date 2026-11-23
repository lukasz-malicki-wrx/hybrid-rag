/** First focusable element of a page: jumps over the navigation to the main landmark. */
export function SkipLink({ label, href = "#main" }: { label: string; href?: string }) {
  return (
    <a
      href={href}
      className="sr-only z-50 rounded-md bg-accent text-accent-fg focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:px-3 focus:py-2"
    >
      {label}
    </a>
  );
}
