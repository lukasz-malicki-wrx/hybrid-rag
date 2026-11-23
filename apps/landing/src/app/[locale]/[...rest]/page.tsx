import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeFromParams } from "@/lib/current-locale";
import { getTranslator } from "@/lib/translator";

export async function generateMetadata({ params }: PageProps<"/[locale]/[...rest]">): Promise<Metadata> {
  return { title: getTranslator(await localeFromParams(params)).t("notFound.title") };
}

// The proxy answers an unknown address with `[locale]/404`. This catch-all is for what it does not
// see (a path with a file extension, a prefetch) and for a direct request without it: the 404 of that
// language (not-found.tsx next to the layout), which a path without a matching route could not give.
export default function UnknownPage() {
  notFound();
}
