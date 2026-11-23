import type { ReactNode } from "react";
import { interpolate, type Params } from "./interpolate";
import { renderRich, type RichTags } from "./rich";
import type { PluralKeys, PluralMessage, TextKeys } from "./types";

export type TFunction<K extends string> = {
  /** Plain text by key, with {placeholders} filled in. */
  (key: K, params?: Params): string;
  /**
   * Text with tags as React nodes: `"See the <link>FAQ</link>"` with `{ link: (c) => <a>{c}</a> }`.
   * The way to put a link or emphasis inside a sentence; no HTML strings.
   */
  rich: (key: K, tags: RichTags, params?: Params) => ReactNode;
};

export type Translator<L extends string, K extends string, P extends string> = {
  locale: L;
  t: TFunction<K>;
  /** Plural text by key; {count} is filled in automatically. */
  tp: (key: P, count: number, params?: Params) => string;
};

function lookup(messages: unknown, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (node, part) => (node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined),
      messages,
    );
}

/**
 * A translator over one language's dictionary. Keys are typed from the dictionary, so a misspelt
 * key does not compile. A key that is missing at run time is returned as it is (visible, not a crash).
 */
export function createTranslator<L extends string, M>(
  locale: L,
  messages: M,
): Translator<L, TextKeys<M>, PluralKeys<M>> {
  const rules = new Intl.PluralRules(locale);
  const text = (key: string): string | undefined => {
    const value = lookup(messages, key);
    return typeof value === "string" ? value : undefined;
  };
  const t = Object.assign(
    (key: string, params?: Params) => {
      const value = text(key);
      return value === undefined ? key : interpolate(value, params);
    },
    {
      rich: (key: string, tags: RichTags, params?: Params): ReactNode => {
        const value = text(key);
        return value === undefined ? key : renderRich(value, tags, params);
      },
    },
  );
  return {
    locale,
    t,
    tp: (key, count, params) => {
      const value = lookup(messages, key) as PluralMessage | undefined;
      if (!value) return key;
      const form = value[rules.select(count)] ?? value.other;
      return interpolate(form, { count, ...params });
    },
  };
}
