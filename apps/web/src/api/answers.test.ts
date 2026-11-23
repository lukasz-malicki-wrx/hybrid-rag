import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { answersApi, ratingOf, rateAnswerOptions, withRating } from "./answers";
import { queryKeys } from "./query-keys";
import type { Answer, ConversationDetail } from "./types";

const answer = (id: string, rating: Answer["rating"] = null): Answer => ({
  id,
  text: "Text [1]",
  refused: false,
  uncited: false,
  stopped: false,
  citations: [1],
  sources: [],
  rating,
  created_at: "2026-11-20T10:00:00Z",
});

const conversation = {
  id: "c",
  messages: [
    { query_id: "q1", question: "?", created_at: "", attachments: [], answer: answer("a1", "up") },
    { query_id: "q2", question: "?", created_at: "", attachments: [], answer: null },
    { query_id: "q3", question: "?", created_at: "", attachments: [], answer: answer("a3") },
  ],
} as unknown as ConversationDetail;

describe("withRating", () => {
  it("changes only the rated answer", () => {
    const next = withRating(conversation, "a3", "down");
    expect(next.messages.map((m) => m.answer?.rating)).toEqual(["up", undefined, "down"]);
  });

  it("withdraws a rating with null", () => {
    expect(withRating(conversation, "a1", null).messages[0].answer?.rating).toBeNull();
  });

  it("does not mutate the cached conversation", () => {
    withRating(conversation, "a1", "down");
    expect(conversation.messages[0].answer?.rating).toBe("up");
  });

  it("skips messages without an answer", () => {
    expect(withRating(conversation, "missing", "up").messages[1].answer).toBeNull();
  });
});

describe("ratingOf", () => {
  it("reads the rating, null when unrated, undefined without the answer", () => {
    expect(ratingOf(conversation, "a1")).toBe("up");
    expect(ratingOf(conversation, "a3")).toBeNull();
    expect(ratingOf(conversation, "missing")).toBeUndefined();
  });
});

describe("rateAnswerOptions", () => {
  const key = queryKeys.conversation("c");
  const setup = () => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    client.setQueryData(key, conversation);
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue();
    const run = (answerId: string, rating: "up" | "down" | null) =>
      client.getMutationCache().build(client, rateAnswerOptions(client, "c")).execute({ answerId, rating });
    return { client, invalidate, run };
  };
  afterEach(() => vi.restoreAllMocks());

  it("refetches the conversation once the rating has settled", async () => {
    vi.spyOn(answersApi, "rate").mockResolvedValue({ answer_id: "a3", rating: "up" });
    const { client, invalidate, run } = setup();
    await run("a3", "up");
    expect(client.getQueryData<typeof conversation>(key)?.messages[2].answer?.rating).toBe("up");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: key });
  });

  it("rolls back only that answer, keeping what arrived meanwhile", async () => {
    let fail: (e: Error) => void = () => {};
    vi.spyOn(answersApi, "rate").mockReturnValue(new Promise((_, reject) => (fail = reject)));
    const { client, run } = setup();
    const pending = run("a1", "down").catch(() => undefined);
    await vi.waitFor(() =>
      expect(client.getQueryData<typeof conversation>(key)?.messages[0].answer?.rating).toBe("down"),
    );
    // A new turn lands while the request is in flight.
    const now = client.getQueryData<typeof conversation>(key)!;
    client.setQueryData(key, {
      ...now,
      messages: [...now.messages, { query_id: "q4", question: "new", created_at: "", attachments: [], answer: answer("a4") }],
    });
    fail(new Error("no"));
    await pending;
    const after = client.getQueryData<typeof conversation>(key)!;
    expect(after.messages).toHaveLength(4);
    expect(after.messages[0].answer?.rating).toBe("up");
  });

  it("refetches only when the last rating of the conversation settles", async () => {
    const releases: Array<() => void> = [];
    vi.spyOn(answersApi, "rate").mockImplementation(
      (answerId, rating) => new Promise((resolve) => releases.push(() => resolve({ answer_id: answerId, rating }))),
    );
    const { invalidate, run } = setup();
    const first = run("a1", null);
    const second = run("a3", "up");
    await vi.waitFor(() => expect(releases).toHaveLength(2));
    releases[0]();
    await first;
    expect(invalidate).not.toHaveBeenCalled();
    releases[1]();
    await second;
    expect(invalidate).toHaveBeenCalledTimes(1);
  });
});
