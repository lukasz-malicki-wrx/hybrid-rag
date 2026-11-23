/** The constant of reciprocal rank fusion that the API uses (apps/api/app/rag/fusion.py). */
export const RRF_K = 60;

/** A chunk of the worked example and its position in each list; `null` when a list does not have it. */
type ExampleChunk = { name: string; meaning: number | null; words: number | null };

/** Invented positions: the example teaches the formula, it is not a measurement. */
export const EXAMPLE_CHUNKS: readonly ExampleChunk[] = [
  { name: "A", meaning: 1, words: 3 },
  { name: "B", meaning: 2, words: null },
  { name: "C", meaning: 4, words: 2 },
  { name: "D", meaning: 7, words: 1 },
];

/** The points one list gives a chunk: 1 / (k + position), nothing when the chunk is not in the list. */
export function rrfPoints(position: number | null, k: number = RRF_K): number {
  return position === null ? 0 : 1 / (k + position);
}

export type FusedChunk = ExampleChunk & { points: number; place: number };

/** The chunks with their summed points and their place after fusion (1 is best); ties keep the input order. */
export function fuse(chunks: readonly ExampleChunk[], k: number = RRF_K): FusedChunk[] {
  const scored = chunks.map((chunk) => ({ ...chunk, points: rrfPoints(chunk.meaning, k) + rrfPoints(chunk.words, k) }));
  const order = [...scored].sort((a, b) => b.points - a.points);
  return scored.map((chunk) => ({ ...chunk, place: order.indexOf(chunk) + 1 }));
}
