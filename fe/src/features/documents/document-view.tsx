"use client";

import { useMemo, useState } from "react";
import { isNotFound } from "@/api/client";
import { documentsApi, useDocument, useDocumentChunks } from "@/api/documents";
import type { Chunk } from "@/api/types";
import { ExternalIcon } from "@/components/icons";
import { BarHeader } from "@/components/ui/bar-header";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { TextInput } from "@/components/ui/text-input";
import { NotFoundView } from "@/features/layout/not-found-view";
import { PageLoading } from "@/features/layout/page-loading";
import { useTranslation } from "@/i18n/use-translation";
import { ChunkCard } from "./chunk-card";
import { ChunkStats } from "./chunk-stats";
import { DocumentStatus } from "./document-status";

/** A document and the chunks it was cut into: the data every search and answer starts from. */
export function DocumentView({ id }: { id: string }) {
  const { t, tp } = useTranslation();
  const document = useDocument(id);
  const chunks = useDocumentChunks(id);
  const [filter, setFilter] = useState("");

  const shown = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    return (chunks.data ?? []).filter((c) => !needle || c.text.toLowerCase().includes(needle));
  }, [chunks.data, filter]);

  if (document.isPending) return <PageLoading label="documentView.loading" />;
  if (!document.data)
    return (
      <NotFoundView
        title={isNotFound(document.error) ? "documentView.notFound" : "documentView.loadError"}
        linkLabel="groups.back"
      />
    );

  const doc = document.data;
  const pages = doc.pages === null ? null : tp("counts.pages", doc.pages);
  const subtitle = [t("scope.version", { version: doc.version }), pages].filter(Boolean).join(" · ");

  return (
    <>
      <BarHeader
        subtitle={subtitle}
        actions={
          doc.status === "ready" && (
            <a
              href={documentsApi.fileUrl(doc.id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-sm hover:bg-surface"
            >
              <ExternalIcon />
              {t("documentView.openPdf")}
            </a>
          )
        }
      >
        <Heading level={1} size="sm" className="truncate">
          {doc.filename}
        </Heading>
      </BarHeader>
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 pb-6 pt-24">
        <DocumentStatus doc={doc} />
        <Text tone="muted" size="sm">
          {t("documentView.intro")}
        </Text>
        {chunks.data && chunks.data.length > 0 && <ChunkStats chunks={chunks.data} />}
        <ChunkList
          isPending={chunks.isPending}
          isError={chunks.isError}
          total={chunks.data?.length ?? 0}
          shown={shown}
          filter={filter}
          onFilter={setFilter}
        />
      </div>
    </>
  );
}

function ChunkList({
  isPending,
  isError,
  total,
  shown,
  filter,
  onFilter,
}: {
  isPending: boolean;
  isError: boolean;
  total: number;
  shown: Chunk[];
  filter: string;
  onFilter: (value: string) => void;
}) {
  const { t, tp } = useTranslation();
  if (isPending) return <PageLoading label="documentView.loadingChunks" />;
  if (isError) return <Text tone="danger">{t("documentView.chunksError")}</Text>;
  if (total === 0) return <Text tone="muted">{t("documentView.noChunks")}</Text>;
  return (
    <section aria-labelledby="chunks-heading" className="space-y-3">
      <Heading id="chunks-heading">{t("documentView.chunks")}</Heading>
      <TextInput
        label={t("documentView.filter")}
        placeholder={t("documentView.filterPlaceholder")}
        value={filter}
        onChange={(e) => onFilter(e.target.value)}
        className="w-full"
      />
      <Text tone="muted" size="sm" role="status">
        {tp("counts.chunksShown", shown.length, { total })}
      </Text>
      <ul className="space-y-3">
        {shown.map((c) => (
          <ChunkCard key={c.id} chunk={c} />
        ))}
      </ul>
    </section>
  );
}
