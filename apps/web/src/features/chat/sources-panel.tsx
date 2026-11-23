"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { BarHeader } from "@hybrid-rag/ui/bar-header";
import { Heading } from "@hybrid-rag/ui/heading";
import { IconButton } from "@hybrid-rag/ui/icon-button";
import { CloseIcon } from "@hybrid-rag/ui/icons";
import { useTranslation } from "@/i18n/use-translation";
import { SourceCard } from "./source-card";
import type { SourcesSelection } from "./use-sources-panel";

/**
 * Excerpts an answer was based on: the cited ones first, then the ones that were searched but
 * not cited. Each links to the original PDF at the cited page.
 */
export function SourcesPanel({ selection, onClose }: { selection: SourcesSelection; onClose: () => void }) {
  const { t, tp } = useTranslation();
  const headingId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const active = useRef<HTMLElement>(null);

  const groups = useMemo(() => {
    const cited = selection.cited
      .map((n) => selection.sources.find((s) => s.n === n))
      .filter((s) => s !== undefined);
    const other = selection.sources.filter((s) => !selection.cited.includes(s.n));
    return [
      { id: "cited", title: t("sources.cited"), sources: cited },
      { id: "other", title: t("sources.notCited"), sources: other },
    ].filter((g) => g.sources.length);
  }, [selection, t]);

  useEffect(() => {
    heading.current?.focus();
  }, []);
  // Braces matter: scrollIntoView may return a promise, which React would call as a cleanup.
  useEffect(() => {
    active.current?.scrollIntoView({ block: "nearest" });
  }, [selection.n]);

  return (
    <aside
      aria-labelledby={headingId}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      className="flex min-h-0 flex-1 flex-col"
    >
      <BarHeader
        subtitle={
          selection.cited.length
            ? tp("counts.citedSources", selection.cited.length)
            : tp("counts.searchedExcerpts", selection.sources.length)
        }
        actions={<IconButton variant="tile" label={t("sources.close")} icon={<CloseIcon />} onClick={onClose} />}
      >
        <Heading level={2} size="bar" id={headingId} ref={heading} tabIndex={-1} className="truncate focus:outline-none">
          {t("sources.title")}
        </Heading>
      </BarHeader>
      {/* `relative`: visually hidden text in the cards stays in this scroll area instead of stretching the page. */}
      <div className="relative mx-4 mb-4 min-h-0 flex-1 space-y-5 overflow-y-auto rounded-lg bg-panel p-4 xl:mx-0">
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`${headingId}-${group.id}`}>
            <Heading level={3} size="overline" id={`${headingId}-${group.id}`} className="mb-2 text-muted">
              {group.title}
            </Heading>
            <ol className="space-y-3">
              {group.sources.map((source) => (
                <li key={source.n}>
                  <SourceCard
                    source={source}
                    selected={source.n === selection.n}
                    ref={source.n === selection.n ? active : undefined}
                  />
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </aside>
  );
}
