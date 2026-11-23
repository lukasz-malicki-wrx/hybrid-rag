import { locale } from "next/root-params";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./i18n";

/** The language of the current route, for server components that do not receive `params` (e.g. not-found). */
export async function getLocale(): Promise<Locale> {
  const value = await locale();
  if (typeof value !== "string" || !isLocale(value)) notFound();
  return value;
}

/** The language from a page's `params` promise. Next types it as a string; an unknown one is a 404. */
export async function localeFromParams(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  return value;
}
