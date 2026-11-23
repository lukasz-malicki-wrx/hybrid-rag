"use client";

import { useMemo, useState, type HTMLAttributes, type ReactNode } from "react";
import { SearchField } from "@hybrid-rag/ui/search-field";
import { useTranslation } from "@/i18n/use-translation";
import { emptyReason, filterByText } from "./filter-items";
import { ScrollList } from "./scroll-list";
import { SidebarEmpty } from "./sidebar-empty";

/**
 * What every section of the column shares: a filter box, the scrolling list of the items that
 * match, and the one-line message when there is nothing to show (no results for the filter, a
 * load error, or an empty list). The section only says how an item looks.
 */
export function FilteredList<T>({
  items,
  isError,
  text,
  searchLabel,
  errorMessage,
  emptyMessage,
  panelProps,
  children,
}: {
  /** The loaded items; `undefined` while loading. */
  items: readonly T[] | undefined;
  isError: boolean;
  /** The text the filter looks at. Keep it stable (module-level or memoised). */
  text: (item: T) => string;
  /** Label and placeholder of the filter box. */
  searchLabel: string;
  errorMessage: string;
  emptyMessage: string;
  /** Attributes of the element around the list (the tab panel of the chats). */
  panelProps?: HTMLAttributes<HTMLDivElement>;
  /** The list of the items that match. */
  children: (shown: readonly T[]) => ReactNode;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const shown = useMemo(() => filterByText(items ?? [], query, text), [items, query, text]);
  const reason = emptyReason({ shown: shown.length, loaded: items?.length, isError, query });
  let message: string | null = null;
  if (reason === "no-match") message = t("sidebar.noResults", { query: query.trim() });
  else if (reason === "error") message = errorMessage;
  else if (reason === "empty") message = emptyMessage;

  return (
    <>
      <SearchField label={searchLabel} placeholder={searchLabel} value={query} onChange={(e) => setQuery(e.target.value)} />
      <ScrollList>
        <div {...panelProps}>
          {shown.length > 0 && children(shown)}
          {message && <SidebarEmpty>{message}</SidebarEmpty>}
        </div>
      </ScrollList>
    </>
  );
}
