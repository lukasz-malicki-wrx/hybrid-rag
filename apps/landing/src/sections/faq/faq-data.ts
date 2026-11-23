/** The questions of the FAQ page by group, in order. Texts: `faq.groups.<group>` and `faq.items.<id>.q|a`. */
export const FAQ_GROUPS = [
  { id: "basics", items: ["whatIs", "accounts", "cost", "licence"] },
  { id: "privacy", items: ["dataWhere", "website", "shared"] },
  { id: "running", items: ["hardware", "models", "languages"] },
  { id: "documents", items: ["fileTypes", "groups"] },
  { id: "answers", items: ["citations", "notFound", "accuracy"] },
] as const;

/** A text with `<tag>...</tag>` markers as plain text: for structured data, where a tag is noise. */
export function plainText(text: string): string {
  return text
    .replace(/<\/?[a-zA-Z][\w-]*>/g, "")
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
