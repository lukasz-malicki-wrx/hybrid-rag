"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/stores/toast-store";
import { request } from "./client";
import { queryKeys } from "./query-keys";
import type { Group, GroupDeleted } from "./types";

export const groupsApi = {
  list: () => request<Group[]>("/groups"),
  get: (id: string) => request<Group>(`/groups/${id}`),
  create: (name: string) =>
    request<Group>("/groups", { method: "POST", body: JSON.stringify({ name }) }),
  rename: (id: string, name: string) =>
    request<Group>(`/groups/${id}`, { method: "PATCH", body: JSON.stringify({ name }) }),
  remove: (id: string) => request<GroupDeleted>(`/groups/${id}`, { method: "DELETE" }),
  removeDocument: (groupId: string, documentId: string) =>
    request<void>(`/groups/${groupId}/documents/${documentId}`, { method: "DELETE" }),
};

export const useGroups = () => useQuery({ queryKey: queryKeys.groups(), queryFn: groupsApi.list });

export const useGroup = (id: string) =>
  useQuery({ queryKey: queryKeys.group(id), queryFn: () => groupsApi.get(id) });

export function useCreateGroup() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: groupsApi.create,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.groups() }),
    onError: notify.error,
  });
}

export function useRenameGroup() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => groupsApi.rename(id, name),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.groups() }),
    onError: notify.error,
  });
}

export function useDeleteGroup() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: groupsApi.remove,
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.groups() }),
        client.invalidateQueries({ queryKey: ["conversations"] }),
      ]),
    onError: notify.error,
  });
}

export function useRemoveFromGroup() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, documentId }: { groupId: string; documentId: string }) =>
      groupsApi.removeDocument(groupId, documentId),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ["documents"] }),
        client.invalidateQueries({ queryKey: queryKeys.groups() }),
      ]),
    onError: notify.error,
  });
}
