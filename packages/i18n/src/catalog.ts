import { richTagNames } from "./rich";

type Node = { [key: string]: Node | string };

const isPlural = (node: Node | string): node is Node =>
  typeof node === "object" && "one" in node && "other" in node && typeof node.one === "string";

/** Every message path of a dictionary ("chat.loading"); a plural message counts as one. */
export function catalogPaths(dictionary: unknown, prefix = ""): string[] {
  return Object.entries(dictionary as Node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" || isPlural(value) ? [path] : catalogPaths(value, path);
  });
}

/** The message at a path: a string, or a plural message as its object. */
export function catalogGet(dictionary: unknown, path: string): string | Record<string, string> | undefined {
  const found = path.split(".").reduce<unknown>((n, p) => (n && typeof n === "object" ? (n as Node)[p] : undefined), dictionary);
  return found as string | Record<string, string> | undefined;
}

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

const sample = (message: string | Record<string, string> | undefined) =>
  typeof message === "string" ? message : (message?.other ?? "");

/**
 * What is wrong with a translation compared to the source language: missing and extra keys,
 * different {placeholders} or <tags>, plural forms the language needs but lacks, empty texts.
 * An empty list means it is complete.
 */
export function compareCatalogs(source: unknown, target: unknown, locale: string): string[] {
  const problems: string[] = [];
  const sourcePaths = catalogPaths(source);
  const targetPaths = catalogPaths(target);
  for (const path of sourcePaths) if (!targetPaths.includes(path)) problems.push(`missing key: ${path}`);
  for (const path of targetPaths) if (!sourcePaths.includes(path)) problems.push(`extra key: ${path}`);
  const needed = new Intl.PluralRules(locale).resolvedOptions().pluralCategories;
  for (const path of sourcePaths.filter((p) => targetPaths.includes(p))) {
    const from = catalogGet(source, path);
    const to = catalogGet(target, path);
    if (typeof from !== typeof to) {
      problems.push(`${path}: plural in one language, plain text in the other`);
      continue;
    }
    if (placeholders(sample(from)).join() !== placeholders(sample(to)).join()) problems.push(`${path}: different placeholders`);
    if (richTagNames(sample(from)).join() !== richTagNames(sample(to)).join()) problems.push(`${path}: different tags`);
    if (typeof to === "string") {
      if (to.trim() === "") problems.push(`${path}: empty`);
    } else if (to) {
      for (const category of needed) if (!to[category]) problems.push(`${path}: missing plural form "${category}"`);
    }
  }
  return problems;
}
