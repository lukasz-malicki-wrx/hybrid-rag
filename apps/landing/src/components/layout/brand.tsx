import Link from "next/link";
import { SparklesIcon } from "@hybrid-rag/ui/icons";
import { tileClass } from "@hybrid-rag/ui/tile";
import { SITE } from "@/config/site";
import type { Locale } from "@/lib/i18n";
import { pagePath } from "@/lib/routes";

/** The mark (the sparkles tile of the app) and the name, linking to the home page. `label` is its accessible name. */
export function Brand({ locale, label }: { locale: Locale; label: string }) {
  return (
    <Link href={pagePath("home", locale)} aria-label={label} className="flex shrink-0 items-center gap-2 rounded-lg font-semibold min-[360px]:gap-2.5">
      <span aria-hidden="true" className={tileClass("accent")}>
        <SparklesIcon />
      </span>
      {/* Never wraps (it would split at the hyphen); a little smaller below 360px so that the header still fits one line at 320px. */}
      <span className="whitespace-nowrap text-base tracking-tight min-[360px]:text-lg">{SITE.name}</span>
    </Link>
  );
}
