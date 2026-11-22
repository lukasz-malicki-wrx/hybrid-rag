"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/stores/toast-store";
import { request } from "./client";
import { queryKeys } from "./query-keys";
import type { Settings } from "./types";

export const PERSONAL_CONTEXT_MAX = 2000;

export const settingsApi = {
  get: () => request<Settings>("/settings"),
  save: (personalContext: string) =>
    request<Settings>("/settings", {
      method: "PUT",
      body: JSON.stringify({ personal_context: personalContext }),
    }),
};

export const useSettings = (enabled = true) =>
  useQuery({ queryKey: queryKeys.settings(), queryFn: settingsApi.get, enabled });

export function useSaveSettings() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.save,
    onSuccess: (saved) => {
      client.setQueryData(queryKeys.settings(), saved);
      notify.info("settings.saved");
    },
    onError: notify.error,
  });
}
