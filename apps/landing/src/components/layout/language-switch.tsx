"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClass } from "@hybrid-rag/ui/button";
import { LanguagesIcon } from "@hybrid-rag/ui/icons";
import { otherLocale, type Locale } from "@/lib/i18n";
import { pageIdFromPath, pagePath } from "@/lib/routes";

/**
 * Switches to the other language and stays on the same page (the home page when the current path
 * is not a known page, e.g. a 404). `name` is the other language's own name, written in that
 * language; the link is marked with `lang`, so that screen readers pronounce it correctly.
 */
export function LanguageSwitch({ locale, name }: { locale: Locale; name: string }) {
  const target = otherLocale(locale);
  const page = pageIdFromPath(usePathname());
  return (
    <Link
      href={pagePath(page?.id ?? "home", target)}
      lang={target}
      hrefLang={target}
      className={buttonClass({ variant: "quiet", size: "sm" })}
    >
      <LanguagesIcon />
      {name}
    </Link>
  );
}
