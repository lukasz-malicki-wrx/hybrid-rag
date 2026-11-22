"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiUrl, query, request } from "./client";
import { queryKeys } from "./query-keys";
import type { Chunk, DocumentInfo, DocumentStatusEvent, Upload } from "./types";

export const MAX_UPLOAD_MB = 50;

export const documentsApi = {
  list: (groupId?: string) => request<DocumentInfo[]>(`/documents${query({ group_id: groupId })}`),
  get: (id: string) => request<DocumentInfo>(`/documents/${id}`),
  chunks: (id: string) => request<Chunk[]>(`/documents/${id}/chunks`),
  upload: (file: File, groupId?: string | null) => {
    const form = new FormData();
    form.append("file", file);
    return request<Upload>(`/documents${query({ group_id: groupId })}`, {
      method: "POST",
      body: form,
    });
  },
  fileUrl: (documentId: string, page?: number) =>
    apiUrl(`/documents/${documentId}/file${page ? `#page=${page}` : ""}`),
  statusUrl: (documentId: string) => apiUrl(`/documents/${documentId}/events`),
};

/** Documents (optionally of one group), re-polled while any is still being processed. */
export const useDocuments = (groupId?: string) =>
  useQuery({
    queryKey: queryKeys.documents(groupId),
    queryFn: () => documentsApi.list(groupId),
    refetchInterval: (q) => (q.state.data?.some((d) => d.status === "processing") ? 4000 : false),
  });

export const useDocument = (id: string) =>
  useQuery({ queryKey: queryKeys.document(id), queryFn: () => documentsApi.get(id) });

/** How a document was cut for search; the cut never changes, so it is not re-fetched. */
export const useDocumentChunks = (id: string) =>
  useQuery({ queryKey: queryKeys.chunks(id), queryFn: () => documentsApi.chunks(id), staleTime: Infinity });

/** Live status of one document over server-sent events; closes once it is ready or failed. */
export function useDocumentStatus(documentId: string | null): DocumentStatusEvent | null {
  const [status, setStatus] = useState<DocumentStatusEvent | null>(null);

  useEffect(() => {
    if (!documentId) return;
    const source = new EventSource(documentsApi.statusUrl(documentId));
    source.onmessage = (e) => {
      const event = JSON.parse(e.data) as DocumentStatusEvent;
      setStatus(event);
      if (event.status !== "processing") source.close();
    };
    return () => source.close();
  }, [documentId]);

  return status;
}
