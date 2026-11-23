type JsonLdValue = string | number | boolean | null | JsonLdValue[] | { [key: string]: JsonLdValue };
export type JsonLdNode = { [key: string]: JsonLdValue };

/**
 * JSON for the inside of a <script type="application/ld+json"> element. "<" is escaped, so that
 * no text, however it ends up in the data, can close the element or open a comment; U+2028/2029
 * are escaped as they are not valid in older JavaScript string literals.
 */
export function serializeJsonLd(data: JsonLdNode): string {
  return JSON.stringify({ "@context": "https://schema.org", ...data })
    .replaceAll("<", "\\u003c")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

/** A BreadcrumbList from (name, absolute URL) pairs, first to last. */
export function breadcrumbList(items: { name: string; url: string }[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
