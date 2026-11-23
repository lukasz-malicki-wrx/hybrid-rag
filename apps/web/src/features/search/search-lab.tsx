"use client";

import { useCallback, useState, type FormEvent } from "react";
import { BarHeader } from "@hybrid-rag/ui/bar-header";
import { Button } from "@hybrid-rag/ui/button";
import { Heading } from "@hybrid-rag/ui/heading";
import { Select } from "@hybrid-rag/ui/select";
import { Text } from "@hybrid-rag/ui/text";
import { TextInput } from "@hybrid-rag/ui/text-input";
import { useDocuments } from "@/api/documents";
import { useSearch } from "@/api/search";
import type { SearchMode } from "@/api/types";
import { Page } from "@/features/layout/page";
import { useTranslation } from "@/i18n/use-translation";
import { SearchModeSelect } from "./search-mode-select";
import { SearchResults } from "./search-results";

/**
 * Runs the retrieval step on its own, with no model involved, and shows each method's rank
 * for every chunk. This is where to see why an answer cited what it did, or missed what it should.
 */
export function SearchLab() {
  const { t } = useTranslation();
  const documents = useDocuments();
  const search = useSearch();
  const [question, setQuestion] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [mode, setMode] = useState<SearchMode>("hybrid");
  const [limit, setLimit] = useState(8);

  const submit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!question.trim()) return;
      search.mutate({
        question: question.trim(),
        document_ids: documentId ? [documentId] : null,
        k: limit,
        mode,
      });
    },
    [search, question, documentId, limit, mode],
  );

  const ready = (documents.data ?? []).filter((d) => d.status === "ready");

  return (
    <Page
      header={
        <BarHeader subtitle={t("searchLab.subtitle")}>
          <Heading level={1} size="bar" className="truncate">
            {t("searchLab.title")}
          </Heading>
        </BarHeader>
      }
    >
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
        <Text tone="muted" size="sm">
          {t("searchLab.intro")}
        </Text>
        <form onSubmit={submit} className="space-y-4">
          <TextInput
            label={t("searchLab.question")}
            placeholder={t("searchLab.placeholder")}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={2000}
            autoFocus
            className="w-full"
          />
          <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
            <Select label={t("searchLab.documents")} value={documentId} onChange={(e) => setDocumentId(e.target.value)} className="w-full">
              <option value="">{t("searchLab.allDocuments")}</option>
              {ready.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename} ({t("scope.version", { version: d.version })})
                </option>
              ))}
            </Select>
            <TextInput
              label={t("searchLab.limit")}
              type="number"
              min={1}
              max={50}
              value={limit}
              onChange={(e) => setLimit(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
              className="w-full"
            />
          </div>
          <SearchModeSelect value={mode} onChange={setMode} />
          <Button type="submit" variant="primary" disabled={search.isPending || !question.trim()}>
            {t("searchLab.submit")}
          </Button>
        </form>
        <div aria-live="polite">
          <SearchResults hits={search.data} pending={search.isPending} />
        </div>
      </div>
    </Page>
  );
}
