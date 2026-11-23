import { describe, expect, it } from "vitest";
import { clockTime, dayLabel, isSameDay, relativeTime, shortTime } from "./format";

describe("relativeTime", () => {
  const now = Date.parse("2026-11-20T12:00:00Z");

  it("formats in the given language", () => {
    expect(relativeTime("2026-11-20T11:55:00Z", "en", now)).toBe("5 minutes ago");
    expect(relativeTime("2026-11-19T12:00:00Z", "en", now)).toBe("yesterday");
    expect(relativeTime("2026-11-20T11:55:00Z", "pl", now)).toBe("5 minut temu");
  });

  it("returns null under a minute", () => {
    expect(relativeTime("2026-11-20T11:59:50Z", "en", now)).toBeNull();
  });
});

describe("time of a day", () => {
  // 2026-11-20 is a Friday. Every call names its zone, so the tests do not depend on the machine.
  const WARSAW = "Europe/Warsaw"; // UTC+1 in November
  const TOKYO = "Asia/Tokyo"; // UTC+9
  const now = Date.parse("2026-11-20T12:00:00Z"); // 13:00 in Warsaw

  describe("isSameDay", () => {
    it("compares calendar days in the zone, not 24-hour periods", () => {
      expect(isSameDay("2026-11-20T22:30:00Z", "2026-11-20T01:00:00Z", "UTC")).toBe(true);
      // Same instants, but Warsaw is already on the 21st at 23:30 UTC.
      expect(isSameDay("2026-11-20T23:30:00Z", "2026-11-20T01:00:00Z", WARSAW)).toBe(false);
      expect(isSameDay("2026-11-20T23:50:00Z", "2026-11-21T00:10:00Z", "UTC")).toBe(false);
    });

    it("accepts dates and timestamps", () => {
      expect(isSameDay(new Date("2026-11-20T10:00:00Z"), now, "UTC")).toBe(true);
    });
  });

  describe("clockTime", () => {
    it("shows hour and minute in 24-hour form, in the zone", () => {
      expect(clockTime("2026-11-20T14:05:00Z", "en", "UTC")).toBe("14:05");
      expect(clockTime("2026-11-20T14:05:00Z", "pl", WARSAW)).toBe("15:05");
    });

    it("takes epoch milliseconds and dates too", () => {
      expect(clockTime(Date.parse("2026-11-20T00:09:00Z"), "en", "UTC")).toBe("00:09");
      expect(clockTime(new Date("2026-11-20T23:59:00Z"), "en", "UTC")).toBe("23:59");
    });
  });

  describe("shortTime", () => {
    it("shows the hour for today, in the zone of the reader", () => {
      expect(shortTime("2026-11-20T08:05:00Z", "en", now, WARSAW)).toBe("09:05");
      expect(shortTime("2026-11-20T08:05:00Z", "pl", now, TOKYO)).toBe("17:05");
    });

    it("uses 24-hour time in both languages", () => {
      expect(shortTime("2026-11-20T14:30:00Z", "en", now, "UTC")).toBe("14:30");
    });

    it("shows the weekday up to six days back", () => {
      expect(shortTime("2026-11-19T12:00:00Z", "en", now, "UTC")).toBe("Thu");
      expect(shortTime("2026-11-14T12:00:00Z", "en", now, "UTC")).toBe("Sat");
      expect(shortTime("2026-11-19T12:00:00Z", "pl", now, "UTC")).toBe("czw.");
    });

    it("shows the date from seven days back", () => {
      expect(shortTime("2026-11-13T12:00:00Z", "en", now, "UTC")).toBe("Nov 13");
      expect(shortTime("2026-10-17T12:00:00Z", "pl", now, "UTC")).toBe("17 paź");
    });

    it("adds the year when it is not this year", () => {
      expect(shortTime("2025-10-17T12:00:00Z", "pl", now, "UTC")).toBe("17 paź 2025");
    });

    it("counts a time in the future as today", () => {
      expect(shortTime("2026-11-20T18:00:00Z", "en", now, "UTC")).toBe("18:00");
    });

    it("decides today by the zone: just after midnight in Tokyo is a new day", () => {
      // 00:30 on the 21st in Tokyo, while it is still the 20th in UTC.
      const early = Date.parse("2026-11-20T15:30:00Z");
      expect(shortTime("2026-11-20T10:00:00Z", "en", early, TOKYO)).toBe("Fri");
      expect(shortTime("2026-11-20T10:00:00Z", "en", early, "UTC")).toBe("10:00");
    });
  });

  describe("dayLabel", () => {
    it("names today and yesterday", () => {
      expect(dayLabel("2026-11-20T01:00:00Z", "en", now, "UTC")).toEqual({ kind: "today" });
      expect(dayLabel("2026-11-19T23:00:00Z", "en", now, "UTC")).toEqual({ kind: "yesterday" });
    });

    it("formats any other day in the language", () => {
      expect(dayLabel("2026-11-18T12:00:00Z", "en", now, "UTC")).toEqual({ kind: "date", text: "Nov 18" });
      expect(dayLabel("2026-10-17T12:00:00Z", "pl", now, "UTC")).toEqual({ kind: "date", text: "17 paź" });
      expect(dayLabel("2025-10-17T12:00:00Z", "pl", now, "UTC")).toEqual({ kind: "date", text: "17 paź 2025" });
    });

    it("uses the calendar day of the zone", () => {
      // 23:30 UTC on the 19th is already the 20th in Warsaw: today.
      expect(dayLabel("2026-11-19T23:30:00Z", "en", now, WARSAW)).toEqual({ kind: "today" });
    });
  });
});
