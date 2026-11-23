import type { Page, Route } from "@playwright/test";

export const MOCK = "/mock-api";
const now = new Date().toISOString();

export const group = {
  id: "g1",
  name: "GxP",
  created_at: now,
  conversation_count: 3,
  document_count: 1,
};

export const conversation = {
  id: "c1",
  group_id: "g1",
  title: "Who certifies batch release?",
  created_at: now,
  updated_at: now,
  favorite: false,
  preview: "Only Qualified Persons may certify batch release [1].",
};

export const conversation2 = {
  ...conversation,
  id: "c2",
  group_id: null,
  title: "How are back-ups checked?",
  preview: "Back-ups are verified at regular intervals [1].",
};

export const doc = {
  id: "d1",
  filename: "annex11.pdf",
  sha256: "a".repeat(64),
  version: 1,
  supersedes_id: null,
  status: "ready",
  active: true,
  pages: 5,
  error: null,
  progress: 9,
  progress_total: 9,
  uploaded_at: now,
  deactivated_at: null,
};

export const source = {
  n: 1,
  chunk_id: 7,
  document_id: "d1",
  filename: "annex11.pdf",
  version: 1,
  page: 5,
  text: "The system should allow only Qualified Persons to certify the release of the batches.",
};

export const answeredMessage = {
  query_id: "q1",
  question: "Who certifies batch release?",
  created_at: now,
  attachments: [] as object[],
  answer: {
    id: "a1",
    text: "Only Qualified Persons may certify batch release [1].",
    refused: false,
    uncited: false,
    stopped: false,
    citations: [1],
    sources: [source],
    rating: null as "up" | "down" | null,
    created_at: now,
  },
};

export const chunks = [
  { id: 1, page: 1, position: 0, text: "Cover page of the annex. ".repeat(12), chars: 300 },
  { id: 2, page: 2, position: 0, text: "Qualified Persons certify batch release.", chars: 40 },
  { id: 3, page: 5, position: 1, text: "Back-ups are checked at intervals.".repeat(8), chars: 270 },
];

export const sse = (...events: object[]) =>
  events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("");

export const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

/** A moment `days` days and `minutes` minutes before now, as the API sends it. */
export const ago = (days: number, minutes = 0) =>
  new Date(Date.now() - days * 86_400_000 - minutes * 60_000).toISOString();

/** Default read endpoints. Tests add or override routes for what they exercise. */
export async function mockApi(page: Page, options: { conversations?: object[] } = {}) {
  const list = (options.conversations ?? [conversation, conversation2]) as (typeof conversation)[];
  await page.route(`**${MOCK}/groups`, (r) => json(r, [group]));
  await page.route(`**${MOCK}/groups/g1`, (r) => json(r, group));
  await page.route(`**${MOCK}/conversations?**`, (r) => {
    const params = new URL(r.request().url()).searchParams;
    const groupId = params.get("group_id");
    return json(
      r,
      list.filter(
        (c) => (params.get("favorites") !== "true" || c.favorite) && (!groupId || c.group_id === groupId),
      ),
    );
  });
  await page.route(`**${MOCK}/conversations/c1`, (r) =>
    r.request().method() === "GET"
      ? json(r, { ...conversation, documents: [], messages: [answeredMessage] })
      : json(r, conversation),
  );
  await page.route(`**${MOCK}/conversations/c2`, (r) =>
    json(r, { ...conversation2, documents: [], messages: [] }),
  );
  await page.route(`**${MOCK}/documents`, (r) => json(r, [doc]));
  await page.route(`**${MOCK}/documents?**`, (r) => json(r, [doc]));
  await page.route(`**${MOCK}/documents/d1`, (r) => json(r, doc));
  await page.route(`**${MOCK}/documents/d1/chunks`, (r) => json(r, chunks));
  await page.route(`**${MOCK}/settings`, (r) => json(r, { personal_context: "", updated_at: null }));
}
