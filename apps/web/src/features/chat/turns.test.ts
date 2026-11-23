import { describe, expect, it } from "vitest";
import { dayDividers, isShortQuestion, startsOfDay } from "./turns";

describe("startsOfDay", () => {
  it("marks the first turn and every change of day", () => {
    const times = ["2025-10-01T10:00:00Z", "2025-10-01T23:00:00Z", "2025-10-02T08:00:00Z", "2025-10-02T09:00:00Z"];
    expect(startsOfDay(times, "UTC")).toEqual([true, false, true, false]);
  });

  it("uses the given time zone for the day", () => {
    const times = ["2025-10-01T21:00:00Z", "2025-10-01T23:30:00Z"];
    expect(startsOfDay(times, "UTC")).toEqual([true, false]);
    expect(startsOfDay(times, "Europe/Warsaw")).toEqual([true, true]);
  });

  it("takes epoch milliseconds too, so a live turn can follow the stored ones", () => {
    const last = Date.parse("2025-10-01T23:50:00Z");
    expect(startsOfDay(["2025-10-01T10:00:00Z", last, last + 20 * 60_000], "UTC")).toEqual([true, false, true]);
  });

  it("is empty for no turns", () => {
    expect(startsOfDay([])).toEqual([]);
  });
});

describe("dayDividers", () => {
  const label = (when: string | number | Date) => `day of ${new Date(when).toISOString().slice(0, 10)}`;

  it("labels only the first moment of each day", () => {
    const times = ["2025-10-01T10:00:00Z", "2025-10-01T11:00:00Z", "2025-10-02T08:00:00Z"];
    expect(dayDividers(times, label, "UTC")).toEqual(["day of 2025-10-01", undefined, "day of 2025-10-02"]);
  });

  it("labels a live turn by the time it was sent, not by when the page was opened", () => {
    // The page was opened on the 1st; the question was sent after midnight.
    const stored = ["2025-10-01T22:00:00Z"];
    const sentAt = Date.parse("2025-10-02T00:30:00Z");
    expect(dayDividers([...stored, sentAt], label, "UTC")).toEqual(["day of 2025-10-01", "day of 2025-10-02"]);
  });

  it("has no divider for a live turn on the day of the last stored one", () => {
    const sentAt = Date.parse("2025-10-01T23:30:00Z");
    expect(dayDividers(["2025-10-01T22:00:00Z", sentAt], label, "UTC")).toEqual(["day of 2025-10-01", undefined]);
  });
});

describe("isShortQuestion", () => {
  it("is true for a short single line", () => {
    expect(isShortQuestion("What is in the report?")).toBe(true);
  });
  it("is false for long or multi-line text", () => {
    expect(isShortQuestion("a".repeat(61))).toBe(false);
    expect(isShortQuestion("one\ntwo")).toBe(false);
  });
});
