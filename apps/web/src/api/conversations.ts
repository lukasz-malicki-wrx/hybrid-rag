"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/stores/toast-store";
import { query, request } from "./client";
import { queryKeys, type ConversationFilter } from "./query-keys";
import type { Conversation, ConversationDetail, DocumentRef } from "./types";

export const FAVOURITE_LIMIT = 10;

export const conversationsApi = {
  list: (filter: ConversationFilter & { limit?: number } = {}) =>
    request<Conversation[]>(
      `/conversations${query({ group_id: filter.groupId, favorites: filter.favorites, limit: filter.limit })}`,
    ),
  get: (id: string) => request<ConversationDetail>(`/conversations/${id}`),
  update: (id: string, changes: { title?: string; favorite?: boolean }) =>
    request<Conversation>(`/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),
  remove: (id: string) => request<void>(`/conversations/${id}`, { method: "DELETE" }),
  setDocuments: (id: string, documentIds: string[]) =>
    request<DocumentRef[]>(`/conversations/${id}/documents`, {
      method: "PUT",
      body: JSON.stringify({ document_ids: documentIds }),
    }),
};

export const useConversations = (filter: ConversationFilter = {}) =>
  useQuery({
    queryKey: queryKeys.conversations(filter),
    queryFn: () =>
      conversationsApi.list({ ...filter, limit: filter.favorites ? FAVOURITE_LIMIT : 50 }),
  });

export const useConversation = (id: string) =>
  useQuery({ queryKey: queryKeys.conversation(id), queryFn: () => conversationsApi.get(id) });

function useInvalidateConversations() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ["conversations"] }),
      client.invalidateQueries({ queryKey: ["conversation"] }),
      client.invalidateQueries({ queryKey: queryKeys.groups() }),
    ]);
}

export function useUpdateConversation() {
  const invalidate = useInvalidateConversations();
  return useMutation({
    mutationFn: ({ id, ...changes }: { id: string; title?: string; favorite?: boolean }) =>
      conversationsApi.update(id, changes),
    onSuccess: invalidate,
    onError: notify.error,
  });
}

export function useDeleteConversation() {
  const invalidate = useInvalidateConversations();
  return useMutation({
    mutationFn: conversationsApi.remove,
    onSuccess: invalidate,
    onError: notify.error,
  });
}

export function useSetConversationDocuments() {
  const invalidate = useInvalidateConversations();
  return useMutation({
    mutationFn: ({ id, documentIds }: { id: string; documentIds: string[] }) =>
      conversationsApi.setDocuments(id, documentIds),
    onSuccess: invalidate,
    onError: notify.error,
  });
}
