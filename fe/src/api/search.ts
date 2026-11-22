"use client";

import { useMutation } from "@tanstack/react-query";
import { notify } from "@/stores/toast-store";
import { request } from "./client";
import type { SearchHit, SearchRequest } from "./types";

export const searchApi = {
  search: (body: SearchRequest) =>
    request<SearchHit[]>("/search", { method: "POST", body: JSON.stringify(body) }),
};

/** Runs a search on demand and keeps the last result until the next one. */
export const useSearch = () => useMutation({ mutationFn: searchApi.search, onError: notify.error });
