import { readEvents } from "@/lib/sse";
import { apiUrl, toApiError } from "./client";
import type { AnswerEvent, AnswerRequest } from "./types";

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
