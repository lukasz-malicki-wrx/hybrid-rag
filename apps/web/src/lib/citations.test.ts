import { describe, expect, it } from "vitest";
import { answerPlainText, answerSegments, citedNumbers, glueCitations, moveLeadingCitations, splitCitations } from "./citations";

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

describe("answerSegments", () => {
  it("drops the space between a word and the marker after it, and keeps other text as it is", () => {
    expect(answerSegments("Backups run daily [1]. Done.", 1)).toEqual([
      { kind: "text", text: "Backups run daily" },
      { kind: "cite", numbers: [1] },
      { kind: "text", text: ". Done." },
    ]);
  });

  it("moves a marker that opens a sentence to its end", () => {
    expect(answerSegments("[1] Backups are tested.", 1)).toEqual([
      { kind: "text", text: "Backups are tested" },
      { kind: "cite", numbers: [1] },
      { kind: "text", text: "." },
    ]);
  });

  it("keeps a marker that points to no source as text", () => {
    expect(answerSegments("See item [7].", 2)).toEqual([{ kind: "text", text: "See item [7]." }]);
  });
});

describe("answerPlainText", () => {
  it("removes citation markers and the space before them", () => {
    expect(answerPlainText("Backups run daily [1]. Restores are tested [2, 3].", 3)).toBe(
      "Backups run daily. Restores are tested.",
    );
  });
  it("moves leading markers like the display does", () => {
    expect(answerPlainText("[1] Backups are tested.", 1)).toBe("Backups are tested.");
  });
  it("keeps markers that point to no source", () => {
    expect(answerPlainText("See item [7].", 2)).toBe("See item [7].");
  });
  it("keeps line breaks", () => {
    expect(answerPlainText("One [1]\n\nTwo", 1)).toBe("One\n\nTwo");
  });
});

describe("glueCitations", () => {
  const glue = (text: string, n = 3) => glueCitations(answerSegments(text, n));

  it("keeps the word before a marker and the punctuation after it together", () => {
    expect(glue("Who did it [1]. Next.")).toEqual([
      { kind: "text", text: "Who did " },
      { kind: "cite", numbers: [1], before: "it", after: "." },
      { kind: "text", text: " Next." },
    ]);
  });

  it("keeps only the end of a very long word, so the line can still break inside it", () => {
    const url = "https://example.com/a/very/long/address/that/does/not/fit";
    expect(glue(`See ${url} [1].`)).toEqual([
      { kind: "text", text: `See ${url.slice(0, -16)}` },
      { kind: "cite", numbers: [1], before: url.slice(-16), after: "." },
    ]);
  });

  it("does not take the word that follows the marker", () => {
    expect(glue("A [1] b")).toEqual([
      { kind: "cite", numbers: [1], before: "A", after: "" },
      { kind: "text", text: " b" },
    ]);
  });

  it("handles adjacent markers and a marker at the very start", () => {
    expect(glue("Both [1][2]; yes")).toEqual([
      { kind: "cite", numbers: [1], before: "Both", after: "" },
      { kind: "cite", numbers: [2], before: "", after: ";" },
      { kind: "text", text: " yes" },
    ]);
  });

  it("changes no text: before + marker + after in place gives the original", () => {
    const flat = (text: string) =>
      glue(text)
        .map((s) => (s.kind === "text" ? s.text : `${s.before}[${s.numbers.join(", ")}]${s.after}`))
        .join("");
    expect(flat("Who did it [1]. Next [2, 3]!")).toBe("Who did it[1]. Next[2, 3]!");
  });
});
