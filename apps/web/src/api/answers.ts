import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { notify } from "@/stores/toast-store";
import { readEvents } from "@/lib/sse";
import { apiUrl, request, toApiError } from "./client";
import { queryKeys } from "./query-keys";
import type { AnswerEvent, AnswerRequest, ConversationDetail, Feedback, Rating } from "./types";

/** The request body; k and mode have server-side defaults. */
export type AskBody = Omit<AnswerRequest, "k" | "mode"> & Partial<Pick<AnswerRequest, "k" | "mode">>;

/**
 * Asks a question and yields the server-sent events of the answer: conversation, sources,
 * tokens, then done (or error). Aborting the signal stops generation on the server.
 */
export async function* streamAnswer(
  body: AskBody,
  signal: AbortSignal,
): AsyncGenerator<AnswerEvent> {
  const res = await fetch(apiUrl("/answers"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw await toApiError(res);
  yield* readEvents<AnswerEvent>(res);
}

export const answersApi = {
  /** Rates an answer; `null` withdraws the rating. */
  rate: (answerId: string, rating: Rating | null) =>
    request<Feedback>(`/answers/${answerId}/feedback`, {
      method: "PUT",
      body: JSON.stringify({ rating }),
    }),
};

/** The conversation with one answer's rating replaced (a copy; the cached object is not touched). */
export function withRating(
  conversation: ConversationDetail,
  answerId: string,
  rating: Rating | null,
): ConversationDetail {
  return {
    ...conversation,
    messages: conversation.messages.map((message) =>
      message.answer?.id === answerId ? { ...message, answer: { ...message.answer, rating } } : message,
    ),
  };
}

/** The rating of one answer in the conversation; `undefined` when there is no such answer. */
export function ratingOf(conversation: ConversationDetail, answerId: string): Rating | null | undefined {
  const answer = conversation.messages.find((m) => m.answer?.id === answerId)?.answer;
  return answer ? (answer.rating ?? null) : undefined;
}

type RateVars = { answerId: string; rating: Rating | null };

/**
 * Options of the mutation that rates an answer of one conversation. The thumb changes at once
 * (optimistic). On failure only that answer goes back to its previous rating, on whatever the
 * cache holds by then (a turn that arrived meanwhile stays). Whatever the outcome, the
 * conversation is refetched once the last rating of it has settled: `onMutate` cancels
 * refetches that are running (they would overwrite the optimistic value), and nothing else
 * would start them again.
 */
export function rateAnswerOptions(client: QueryClient, conversationId: string) {
  const key = queryKeys.conversation(conversationId);
  const mutationKey = ["rate-answer", conversationId] as const;
  return {
    mutationKey,
    mutationFn: ({ answerId, rating }: RateVars) => answersApi.rate(answerId, rating),
    onMutate: async ({ answerId, rating }: RateVars) => {
      await client.cancelQueries({ queryKey: key });
      const current = client.getQueryData<ConversationDetail>(key);
      const previous = current ? ratingOf(current, answerId) : undefined;
      if (current) client.setQueryData<ConversationDetail>(key, withRating(current, answerId, rating));
      return { previous };
    },
    onError: (error: Error, { answerId }: RateVars, context: { previous: Rating | null | undefined } | undefined) => {
      const current = client.getQueryData<ConversationDetail>(key);
      if (current && context?.previous !== undefined) {
        client.setQueryData<ConversationDetail>(key, withRating(current, answerId, context.previous));
      }
      notify.error(error);
    },
    onSettled: () => {
      // The mutation that is settling still counts as running here.
      if (client.isMutating({ mutationKey }) <= 1) void client.invalidateQueries({ queryKey: key });
    },
  };
}

/** Rates an answer of one conversation; see `rateAnswerOptions`. */
export function useRateAnswer(conversationId: string) {
  const client = useQueryClient();
  return useMutation(rateAnswerOptions(client, conversationId));
}
