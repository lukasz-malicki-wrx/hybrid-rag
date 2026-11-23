import { describe, expect, it } from "vitest";
import { emptyReason, filterByText, normalizeText } from "./filter-items";

const items = [{ t: "Żółw i Łódź" }, { t: "Batch release" }, { t: "Café" }];
const by = (q: string) => filterByText(items, q, (i) => i.t).map((i) => i.t);

describe("normalizeText", () => {
  it("drops case and diacritics", () => {
    expect(normalizeText("  ŻÓŁW Łódź ")).toBe("zolw lodz");
  });
});

describe("filterByText", () => {
  it("returns everything for a blank query", () => {
    expect(filterByText(items, "  ", (i) => i.t)).toBe(items);
  });
  it("ignores case and diacritics on both sides", () => {
    expect(by("zolw")).toEqual(["Żółw i Łódź"]);
    expect(by("ŁÓDŹ")).toEqual(["Żółw i Łódź"]);
    expect(by("cafe")).toEqual(["Café"]);
    expect(by("RELEASE")).toEqual(["Batch release"]);
  });
  it("returns nothing when nothing matches", () => {
    expect(by("xyz")).toEqual([]);
  });
});

describe("emptyReason", () => {
  const base = { shown: 0, loaded: 3, isError: false, query: "" };
  it("is null while items are shown or nothing has loaded", () => {
    expect(emptyReason({ ...base, shown: 2 })).toBeNull();
    expect(emptyReason({ ...base, loaded: undefined })).toBeNull();
  });
  it("says the filter matched nothing when there was something to match", () => {
    expect(emptyReason({ ...base, query: " zzz " })).toBe("no-match");
    expect(emptyReason({ ...base, loaded: 0, query: "zzz" })).toBe("empty");
  });
  it("reports a load error, then an empty list", () => {
    expect(emptyReason({ ...base, loaded: undefined, isError: true })).toBe("error");
    expect(emptyReason({ ...base, loaded: 0 })).toBe("empty");
  });
});
