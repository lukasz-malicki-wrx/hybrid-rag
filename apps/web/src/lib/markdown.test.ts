import { describe, expect, it } from "vitest";
import { parseBlocks, parseInline, stripMarkdown } from "./markdown";

describe("parseBlocks", () => {
  it("reads bullet and numbered lists, also with blank lines between the points", () => {
    expect(parseBlocks("Two steps:\n\n1. Plug it in [1].\n\n2. Reset it [2].\n- one\n* two")).toEqual([
      { kind: "paragraph", text: "Two steps:" },
      { kind: "list", ordered: true, start: 1, items: ["Plug it in [1].", "Reset it [2]."] },
      { kind: "list", ordered: false, start: 1, items: ["one", "two"] },
    ]);
  });

  it("keeps a list's first number, continues an item on an indented line, and ends the list at text", () => {
    expect(parseBlocks("3. third\n   still third\nAfter.")).toEqual([
      { kind: "list", ordered: true, start: 3, items: ["third still third"] },
      { kind: "paragraph", text: "After." },
    ]);
  });

  it("reads headings and keeps line breaks inside a paragraph", () => {
    expect(parseBlocks("## Summary\nLine one\nline two")).toEqual([
      { kind: "heading", text: "Summary" },
      { kind: "paragraph", text: "Line one\nline two" },
    ]);
  });

  it("treats a single answer line as one paragraph, citations included", () => {
    expect(parseBlocks("- SCHE/24385/1/2023 [1]")).toEqual([
      { kind: "list", ordered: false, start: 1, items: ["SCHE/24385/1/2023 [1]"] },
    ]);
  });
});

describe("parseInline", () => {
  it("splits bold, italic and code, and leaves unpaired marks as text", () => {
    expect(parseInline("A **bold** and *it* with `x=1`, 2 * 3 and **open")).toEqual([
      { style: "plain", text: "A " },
      { style: "strong", text: "bold" },
      { style: "plain", text: " and " },
      { style: "em", text: "it" },
      { style: "plain", text: " with " },
      { style: "code", text: "x=1" },
      { style: "plain", text: ", 2 * 3 and **open" },
    ]);
  });

  it("never produces HTML: tags stay text", () => {
    expect(parseInline("<b>hi</b>")).toEqual([{ style: "plain", text: "<b>hi</b>" }]);
  });
});

describe("stripMarkdown", () => {
  it("drops emphasis marks and keeps lists readable", () => {
    expect(stripMarkdown("**Area**: 130 m2\n\n- one\n- *two*")).toBe("Area: 130 m2\n\n- one\n- two");
  });
});
