import { describe, expect, it } from "vitest";
import { formatDate } from "./format-date";

describe("formatDate", () => {
  it("writes the date in the language, without moving a day", () => {
    expect(formatDate("2026-11-22", "en")).toBe("November 22, 2026");
    expect(formatDate("2026-11-22", "pl")).toBe("22 listopada 2026");
    expect(formatDate("2026-01-01", "en")).toBe("January 1, 2026");
  });
});
