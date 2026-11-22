import { describe, expect, it } from "vitest";
import { citedNumbers, moveLeadingCitations, splitCitations } from "./citations";

describe("splitCitations", () => {
  it("splits text and citation groups", () => {
    expect(splitCitations("Backups [1]. Restore [2, 3].", 3)).toEqual([
      { kind: "text", text: "Backups " },
      { kind: "cite", numbers: [1] },
      { kind: "text", text: ". Restore " },
      { kind: "cite", numbers: [2, 3] },
      { kind: "text", text: "." },
    ]);
  });

  it("keeps out-of-range numbers as text", () => {
    expect(splitCitations("See [9].", 2)).toEqual([{ kind: "text", text: "See [9]." }]);
  });

  it("drops only the invalid numbers of a group", () => {
    expect(splitCitations("[1, 7]", 2)).toEqual([{ kind: "cite", numbers: [1] }]);
  });
});

describe("moveLeadingCitations", () => {
  it("moves a citation that opens a sentence to its end", () => {
    expect(moveLeadingCitations("[1] Adapter reads the bus. [2] It needs power.")).toBe(
      "Adapter reads the bus [1]. It needs power [2].",
    );
  });

  it("handles groups and several markers", () => {
    expect(moveLeadingCitations("[1][2] Both say so.")).toBe("Both say so [1][2].");
    expect(moveLeadingCitations("[1, 3] Both say so.")).toBe("Both say so [1,3].");
  });

  it("does not split numbers with a decimal point", () => {
    expect(moveLeadingCitations("[1] A 3.3V module may not boot.")).toBe("A 3.3V module may not boot [1].");
  });

  it("leaves correctly placed citations alone", () => {
    const text = "Backups are tested [2]. Restores too [1].";
    expect(moveLeadingCitations(text)).toBe(text);
  });

  it("works on lines and on an unfinished sentence while streaming", () => {
    expect(moveLeadingCitations("Intro:\n[1] Step one")).toBe("Intro:\nStep one [1]");
  });
});

describe("citedNumbers", () => {
  it("lists the valid numbers once", () => {
    expect(citedNumbers("A [2]. B [1][2]. C [9].", 3)).toEqual([2, 1]);
  });
});
