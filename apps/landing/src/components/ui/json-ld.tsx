import { serializeJsonLd, type JsonLdNode } from "@/lib/json-ld";

/** Structured data for search engines. The data is escaped so that it cannot end the script element. */
export function JsonLd({ data }: { data: JsonLdNode }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
