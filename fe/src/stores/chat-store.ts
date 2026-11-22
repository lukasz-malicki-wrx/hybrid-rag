import { create } from "zustand";
import type { Source } from "@/api/types";

export type TurnStatus = "connecting" | "streaming" | "done" | "stopped" | "error";

/** A file sent with a question. */
export type Attachment = { id: string; filename: string };

/**
 * A question being answered, shown until its stored version has loaded. Keyed by conversation
 * id; a question that starts a new conversation uses a temporary key until the server names it.
 */
export type ActiveTurn = {
  key: string;
  conversationId: string | null;
  question: string;
  attachments: Attachment[];
  /** Messages the conversation had when the question was sent. */
  baseCount: number;
  sources: Source[];
  text: string;
  status: TurnStatus;
  /** The request is still open (until done, stopped or failed). */
  busy: boolean;
  error?: string;
  refused?: boolean;
  uncited?: boolean;
};

type TurnPatch = Partial<ActiveTurn> | ((turn: ActiveTurn) => Partial<ActiveTurn>);

type ChatState = {
  turns: Record<string, ActiveTurn>;
  controllers: Record<string, AbortController>;
  begin: (turn: Omit<ActiveTurn, "busy">, controller: AbortController) => void;
  update: (key: string, patch: TurnPatch) => void;
  /** Moves a new conversation's turn from its temporary key to the conversation id. */
  rekey: (from: string, to: string) => void;
  finish: (key: string) => void;
  /** Aborts that turn's request; the API then stops the model and stores the partial answer. */
  stop: (key: string) => void;
};

let nextTemporaryKey = 1;
/** Key for a question that starts a new conversation (no id yet). */
export const newTurnKey = () => `new:${nextTemporaryKey++}`;

function without<T>(record: Record<string, T>, key: string): Record<string, T> {
  const copy = { ...record };
  delete copy[key];
  return copy;
}

/**
 * Answers being streamed, one per conversation, several conversations at once. Outside React,
 * so they survive navigation and components re-render only for the turn they read.
 */
export const useChatStore = create<ChatState>()((set, get) => ({
  turns: {},
  controllers: {},
  begin: (turn, controller) =>
    set((s) => ({
      turns: { ...s.turns, [turn.key]: { ...turn, busy: true } },
      controllers: { ...s.controllers, [turn.key]: controller },
    })),
  update: (key, patch) => {
    const turn = get().turns[key];
    if (!turn) return;
    const changes = typeof patch === "function" ? patch(turn) : patch;
    set((s) => ({ turns: { ...s.turns, [key]: { ...turn, ...changes } } }));
  },
  rekey: (from, to) => {
    const { turns, controllers } = get();
    const turn = turns[from];
    if (!turn || from === to) return;
    set({
      turns: { ...without(turns, from), [to]: { ...turn, key: to, conversationId: to } },
      controllers: controllers[from]
        ? { ...without(controllers, from), [to]: controllers[from] }
        : controllers,
    });
  },
  finish: (key) =>
    set((s) => ({
      turns: s.turns[key] ? { ...s.turns, [key]: { ...s.turns[key], busy: false } } : s.turns,
      controllers: without(s.controllers, key),
    })),
  stop: (key) => get().controllers[key]?.abort(),
}));
