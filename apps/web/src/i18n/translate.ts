import type { Locale } from "./config";
import { MESSAGES, type MessageKey, type PluralKey } from "./messages";
import type { PluralMessage } from "./types";

export type Params = Record<string, string | number>;

export function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

export function lookup(messages: unknown, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined,
      messages,
    );
}

export type Translator = {
  locale: Locale;
  /** Plain text by key, with {placeholders} filled in. */
  t: (key: MessageKey, params?: Params) => string;
  /** Plural text by key; {count} is filled in automatically. */
  tp: (key: PluralKey, count: number, params?: Params) => string;
};

export function createTranslator(locale: Locale): Translator {
  const messages = MESSAGES[locale];
  const rules = new Intl.PluralRules(locale);
  return {
    locale,
    t: (key, params) => {
      const value = lookup(messages, key);
      return typeof value === "string" ? interpolate(value, params) : key;
    },
    tp: (key, count, params) => {
      const value = lookup(messages, key) as PluralMessage | undefined;
      if (!value) return key;
      const form = value[rules.select(count)] ?? value.other;
      return interpolate(form, { count, ...params });
    },
  };
}
