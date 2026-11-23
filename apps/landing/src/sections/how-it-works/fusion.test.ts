import { describe, expect, it } from "vitest";
import { EXAMPLE_CHUNKS, fuse, rrfPoints, RRF_K } from "./fusion";

describe("rrfPoints", () => {
  it("is 1 / (60 + position), and nothing for a chunk that is not in the list", () => {
    expect(RRF_K).toBe(60);
    expect(rrfPoints(1)).toBeCloseTo(1 / 61, 12);
    expect(rrfPoints(7)).toBeCloseTo(1 / 67, 12);
    expect(rrfPoints(null)).toBe(0);
  });
});

describe("fuse", () => {
  const byName = Object.fromEntries(fuse(EXAMPLE_CHUNKS).map((c) => [c.name, c]));

  it("adds the points of both lists", () => {
    expect(byName.A?.points).toBeCloseTo(1 / 61 + 1 / 63, 12);
    expect(byName.B?.points).toBeCloseTo(1 / 62, 12);
  });

  it("puts a chunk that is high in both lists above one that is first in only one", () => {
    // The page's text says: D is first in the words and seventh in meaning, so it ends third;
    // C is fourth and second and is above it; B is in one list only.
    expect(byName.D).toMatchObject({ words: 1, meaning: 7, place: 3 });
    expect(byName.C).toMatchObject({ words: 2, meaning: 4, place: 2 });
    expect(byName.A?.place).toBe(1);
    expect(byName.B).toMatchObject({ words: null, place: 4 });
  });

  it("keeps the order of the input and gives every chunk its own place", () => {
    expect(fuse(EXAMPLE_CHUNKS).map((c) => c.name)).toEqual(EXAMPLE_CHUNKS.map((c) => c.name));
    expect(fuse(EXAMPLE_CHUNKS).map((c) => c.place).sort()).toEqual([1, 2, 3, 4]);
  });
});
