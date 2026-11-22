import { create } from "zustand";
import type { MessageKey } from "@/i18n/messages";
import type { Params } from "@/i18n/translate";

/** A notification: a translated text (key) or an error (its API message, else a generic one). */
export type Toast = {
  id: number;
  tone: "info" | "error";
  key?: MessageKey;
  params?: Params;
  error?: unknown;
};

type ToastState = {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
};

const VISIBLE_MS = 6000;
let nextId = 1;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = nextId++;
    set({ toasts: [...get().toasts, { ...toast, id }] });
    setTimeout(() => get().dismiss(id), VISIBLE_MS);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

/** Show a notification from anywhere, including outside React (e.g. mutation callbacks). */
export const notify = {
  info: (key: MessageKey, params?: Params) => useToastStore.getState().push({ tone: "info", key, params }),
  warn: (key: MessageKey, params?: Params) => useToastStore.getState().push({ tone: "error", key, params }),
  error: (error: unknown) => useToastStore.getState().push({ tone: "error", error }),
};
