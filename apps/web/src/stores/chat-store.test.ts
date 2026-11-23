import { beforeEach, describe, expect, it } from "vitest";
import { newTurnKey, useChatStore, type ActiveTurn } from "./chat-store";

const turn = (key: string, conversationId: string | null): Omit<ActiveTurn, "busy"> => ({
  key,
  conversationId,
  question: "q",
  attachments: [],
  startedAt: 1_000,
  baseCount: 0,
  sources: [],
  text: "",
  status: "connecting",
});

describe("chat store", () => {
  beforeEach(() => useChatStore.setState({ turns: {}, controllers: {} }));

  it("keeps several conversations answering at once", () => {
    const { begin } = useChatStore.getState();
    begin(turn("c1", "c1"), new AbortController());
    begin(turn("c2", "c2"), new AbortController());
    const { turns } = useChatStore.getState();
    expect(turns.c1.busy && turns.c2.busy).toBe(true);
  });

  it("stops only the conversation it is asked to stop", () => {
    const a = new AbortController();
    const b = new AbortController();
    useChatStore.getState().begin(turn("c1", "c1"), a);
    useChatStore.getState().begin(turn("c2", "c2"), b);
    useChatStore.getState().stop("c2");
    expect(a.signal.aborted).toBe(false);
    expect(b.signal.aborted).toBe(true);
  });

  it("moves a new conversation's turn to its id", () => {
    const key = newTurnKey();
    const controller = new AbortController();
    useChatStore.getState().begin(turn(key, null), controller);
    useChatStore.getState().rekey(key, "c9");
    const { turns, controllers } = useChatStore.getState();
    expect(turns[key]).toBeUndefined();
    expect(turns.c9).toMatchObject({ key: "c9", conversationId: "c9", busy: true });
    expect(controllers.c9).toBe(controller);
  });

  it("keeps the time the question was sent through updates, moving and finishing", () => {
    const key = newTurnKey();
    useChatStore.getState().begin({ ...turn(key, null), startedAt: 1_700_000_000_000 }, new AbortController());
    useChatStore.getState().update(key, (t) => ({ text: t.text + "hi", status: "streaming" }));
    useChatStore.getState().rekey(key, "c9");
    useChatStore.getState().finish("c9");
    expect(useChatStore.getState().turns.c9.startedAt).toBe(1_700_000_000_000);
  });

  it("finishing keeps the turn on screen but no longer busy", () => {
    useChatStore.getState().begin(turn("c1", "c1"), new AbortController());
    useChatStore.getState().update("c1", (t) => ({ text: t.text + "hi", status: "streaming" }));
    useChatStore.getState().finish("c1");
    const { turns, controllers } = useChatStore.getState();
    expect(turns.c1).toMatchObject({ text: "hi", busy: false });
    expect(controllers.c1).toBeUndefined();
  });
});
