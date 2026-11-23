import { describe, expect, it } from "vitest";
import { tileClass } from "./tile";

describe("tileClass", () => {
  it("is a 32px rounded square on a surface by default", () => {
    const classes = tileClass().split(" ");
    expect(classes).toEqual(expect.arrayContaining(["size-8", "rounded-lg", "bg-surface"]));
  });

  it("has exactly one background and one text colour, whatever the tone", () => {
    for (const tone of ["surface", "danger", "accent"] as const) {
      const classes = tileClass(tone).split(" ");
      expect(classes.filter((c) => /^bg-/.test(c)), tone).toHaveLength(1);
      expect(classes.filter((c) => /^text-[a-z-]+$/.test(c)), tone).toHaveLength(1);
    }
  });

  it("appends the caller's layout classes", () => {
    expect(tileClass("accent", "ml-2")).toMatch(/ ml-2$/);
  });
});
