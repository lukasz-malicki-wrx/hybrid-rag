import { describe, expect, it } from "vitest";
import { relativeTime } from "./format";

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
