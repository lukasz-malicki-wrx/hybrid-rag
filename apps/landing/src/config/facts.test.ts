import { describe, expect, it } from "vitest";
import { factParams, factValue } from "./facts";

describe("factParams", () => {
  it("writes numbers in the format of the language", () => {
    expect(factParams("en").gateDistance).toBe("0.5");
    expect(factParams("pl").gateDistance).toBe("0,5");
    expect(factParams("pl").nearestAnswerable).toBe("0,474");
    expect(factParams("en").vectorTop10).toBe("91%");
    expect(factParams("en").chunkChars).toBe("1,800");
  });

  it("has the one set of evaluation numbers the home page, the about page and the texts quote", () => {
    const en = factParams("en");
    expect([en.evalQuestions, en.evalAnswerable, en.evalOffTopic, en.evalOffTopicRefused, en.evalDocuments, en.evalPassages]).toEqual(["44", "34", "10", "10", "4", "122"]);
    expect(en.hybridTop10).toBe("100%");
    expect(factValue("evalQuestions")).toBe(factValue("evalAnswerable") + factValue("evalOffTopic"));
  });

  it("keeps the raw number for code that computes with it", () => {
    expect(factValue("evalQuestions")).toBe(44);
  });
});
