"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { MAX_UPLOAD_MB, documentsApi } from "@/api/documents";
import { queryKeys } from "@/api/query-keys";
import type { Attachment } from "@/stores/chat-store";
import { notify } from "@/stores/toast-store";

export type AttachmentStatus = "uploading" | "processing" | "ready" | "failed";

export type PendingAttachment = {
  key: string;
  name: string;
  documentId?: string;
  status: AttachmentStatus;
  progress?: { done: number; total: number };
  /** Message from the API, if any. */
  error?: string;
};

let nextKey = 1;

const isPdf = (file: File) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

/**
 * Files attached to the message being written. Each file is uploaded as soon as it is added
 * (into the group, if any); indexing progress is reported back by the chips via `update`.
 */
export function useAttachments(groupId?: string | null) {
  const client = useQueryClient();
  const [items, setItems] = useState<PendingAttachment[]>([]);

  const update = useCallback(
    (key: string, changes: Partial<PendingAttachment>) =>
      setItems((list) => list.map((a) => (a.key === key ? { ...a, ...changes } : a))),
    [],
  );

  const add = useCallback(
    (files: FileList | File[]) => {
      for (const file of Array.from(files)) {
        if (!isPdf(file)) {
          notify.warn("composer.onlyPdf", { name: file.name });
          continue;
        }
        if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
          notify.warn("composer.tooLarge", { name: file.name, mb: MAX_UPLOAD_MB });
          continue;
        }
        const key = `a${nextKey++}`;
        setItems((list) => [...list, { key, name: file.name, status: "uploading" }]);
        documentsApi
          .upload(file, groupId)
          .then((doc) => {
            update(key, {
              documentId: doc.id,
              status: doc.status,
              error: doc.status === "failed" ? (doc.error ?? undefined) : undefined,
            });
            client.invalidateQueries({ queryKey: ["documents"] });
            client.invalidateQueries({ queryKey: queryKeys.groups() });
          })
          .catch((error: unknown) =>
            update(key, { status: "failed", error: error instanceof Error ? error.message : undefined }),
          );
      }
    },
    [client, groupId, update],
  );

  const remove = useCallback((key: string) => setItems((list) => list.filter((a) => a.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const pendingCount = useMemo(
    () => items.filter((a) => a.status === "uploading" || a.status === "processing").length,
    [items],
  );
  const attached = useMemo<Attachment[]>(
    () =>
      items
        .filter((a) => a.documentId && a.status !== "failed")
        .map((a) => ({ id: a.documentId as string, filename: a.name })),
    [items],
  );

  return { items, add, update, remove, clear, pendingCount, attached };
}
