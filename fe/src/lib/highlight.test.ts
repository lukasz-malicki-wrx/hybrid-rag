import { describe, expect, it } from "vitest";
import { splitMatches } from "./highlight";

describe("splitMatches", () => {
  it("marks every occurrence, ignoring case, and keeps the original spelling", () => {
    expect(splitMatches("Back-ups and BACK-UPS", "back-ups")).toEqual([
      { text: "Back-ups", match: true },
      { text: " and ", match: false },
      { text: "BACK-UPS", match: true },
    ]);
  });

  it("returns the whole text when nothing matches or the needle is blank", () => {
    expect(splitMatches("abc", "x")).toEqual([{ text: "abc", match: false }]);
    expect(splitMatches("abc", "  ")).toEqual([{ text: "abc", match: false }]);
  });

  it("treats the needle as plain text, not a pattern", () => {
    expect(splitMatches("a.c abc", "a.c")).toEqual([
      { text: "a.c", match: true },
      { text: " abc", match: false },
    ]);
  });

  it("loses nothing: the parts join back into the text", () => {
    const text = "x aa aaa y";
    expect(splitMatches(text, "aa").map((p) => p.text).join("")).toBe(text);
  });
});
