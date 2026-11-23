import type { Dictionary, PluralKeys, TextKeys } from "@hybrid-rag/i18n";
import type { Locale } from "@/lib/i18n";
import enCommon from "./en/common.json";
import enHome from "./en/home.json";
import enFeatures from "./en/features.json";
import enHowItWorks from "./en/howItWorks.json";
import enPricing from "./en/pricing.json";
import enAbout from "./en/about.json";
import enFaq from "./en/faq.json";
import enPrivacy from "./en/privacy.json";
import enAccessibility from "./en/accessibility.json";
import enNotFound from "./en/notFound.json";
import enScreenshots from "./en/screenshots.json";
import enMeta from "./en/meta.json";
import plCommon from "./pl/common.json";
import plHome from "./pl/home.json";
import plFeatures from "./pl/features.json";
import plHowItWorks from "./pl/howItWorks.json";
import plPricing from "./pl/pricing.json";
import plAbout from "./pl/about.json";
import plFaq from "./pl/faq.json";
import plPrivacy from "./pl/privacy.json";
import plAccessibility from "./pl/accessibility.json";
import plNotFound from "./pl/notFound.json";
import plScreenshots from "./pl/screenshots.json";
import plMeta from "./pl/meta.json";

/** English: the source of truth. Every key of every namespace is typed from here. */
const en = {
  common: enCommon,
  home: enHome,
  features: enFeatures,
  howItWorks: enHowItWorks,
  pricing: enPricing,
  about: enAbout,
  faq: enFaq,
  privacy: enPrivacy,
  accessibility: enAccessibility,
  notFound: enNotFound,
  screenshots: enScreenshots,
  meta: enMeta,
};

type Messages = Dictionary<typeof en>;
export type MessageKey = TextKeys<typeof en>;
export type PluralKey = PluralKeys<typeof en>;

// A namespace or key that is missing here does not type-check; extra keys, other placeholders and missing
// plural forms are caught by messages.test.ts.
const pl: Messages = {
  common: plCommon,
  home: plHome,
  features: plFeatures,
  howItWorks: plHowItWorks,
  pricing: plPricing,
  about: plAbout,
  faq: plFaq,
  privacy: plPrivacy,
  accessibility: plAccessibility,
  notFound: plNotFound,
  screenshots: plScreenshots,
  meta: plMeta,
};

export const MESSAGES: Record<Locale, Messages> = { en, pl };
