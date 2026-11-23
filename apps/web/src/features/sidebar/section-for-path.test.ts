import { describe, expect, it } from "vitest";
import { isSearchLabPath, sectionForPath } from "./section-for-path";

describe("sectionForPath", () => {
  it.each([
    ["/", "chats"],
    ["/c/123", "chats"],
    ["/g/abc", "groups"],
    ["/g", "groups"],
    ["/d/xyz", "documents"],
    ["/search", null],
    ["/nope", null],
  ])("%s -> %s", (path, section) => {
    expect(sectionForPath(path)).toBe(section);
  });
});

describe("isSearchLabPath", () => {
  it("matches the search lab only", () => {
    expect(isSearchLabPath("/search")).toBe(true);
    expect(isSearchLabPath("/searching")).toBe(false);
    expect(isSearchLabPath("/")).toBe(false);
  });
});
