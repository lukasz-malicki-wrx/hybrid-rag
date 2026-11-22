/** A message with plural forms, chosen with Intl.PluralRules (Polish uses one/few/many). */
export type PluralMessage = {
  readonly one: string;
  readonly other: string;
  readonly zero?: string;
  readonly two?: string;
  readonly few?: string;
  readonly many?: string;
};

type Leaf = string | PluralMessage;

/** The shape every language must have: the English dictionary with all texts as `string`. */
export type Dictionary<T> = {
  readonly [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends PluralMessage
      ? PluralMessage
      : Dictionary<T[K]>;
};

type Join<P extends string, K extends string> = P extends "" ? K : `${P}.${K}`;

/** Dot paths of plain texts, e.g. "chat.loading". */
export type TextKeys<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? Join<P, K>
    : T[K] extends PluralMessage
      ? never
      : TextKeys<T[K], Join<P, K>>;
}[keyof T & string];

/** Dot paths of plural messages, e.g. "counts.conversations". */
export type PluralKeys<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? never
    : T[K] extends PluralMessage
      ? Join<P, K>
      : PluralKeys<T[K], Join<P, K>>;
}[keyof T & string];

export type { Leaf };
