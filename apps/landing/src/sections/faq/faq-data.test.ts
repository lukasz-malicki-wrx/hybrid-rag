import { describe, expect, it } from "vitest";
import { MESSAGES } from "@/messages";
import { FAQ_GROUPS, plainText } from "./faq-data";

describe("plainText", () => {
  it("removes rich tags and keeps the words", () => {
    expect(plainText("Set <code>LLM_MODEL</code>, see <how>how it works</how>.")).toBe("Set LLM_MODEL, see how it works.");
  });

  it("turns non-breaking spaces into spaces and trims", () => {
    expect(plainText(" a b  c ")).toBe("a b c");
  });
});

describe("FAQ groups", () => {
  it("list every question of the catalog once, and every group has a title", () => {
    const listed = FAQ_GROUPS.flatMap((g) => g.items);
    expect(new Set(listed).size).toBe(listed.length);
    expect([...listed].sort()).toEqual(Object.keys(MESSAGES.en.faq.items).sort());
    expect(FAQ_GROUPS.map((g) => g.id).sort()).toEqual(Object.keys(MESSAGES.en.faq.groups).sort());
  });
});
