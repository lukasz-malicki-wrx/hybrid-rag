import type { Locale } from "./config";
import { en } from "./messages/en";
import { pl } from "./messages/pl";
import type { Dictionary, PluralKeys, TextKeys } from "./types";

export type Messages = Dictionary<typeof en>;
export type MessageKey = TextKeys<typeof en>;
export type PluralKey = PluralKeys<typeof en>;

export const MESSAGES: Record<Locale, Messages> = { en, pl };
