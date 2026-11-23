import { describe, expect, it } from "vitest";
import { MESSAGES } from "@/messages";
import { formatCount, formatPrice, PLAN_IDS, PLANS, TABLE } from "./pricing";

describe("pricing config", () => {
  it("has the three plans in order, 0, 9 and 29 euros a month", () => {
    expect(PLANS.map((p) => [p.id, p.monthly])).toEqual([
      ["free", 0],
      ["basic", 9],
      ["unlimited", 29],
    ]);
    expect(PLANS.map((p) => p.id)).toEqual([...PLAN_IDS]);
  });

  it("has prices that are whole and rise with the plan", () => {
    const prices = PLANS.map((p) => p.monthly);
    expect(prices.every(Number.isInteger)).toBe(true);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("offers only Free today", () => {
    expect(PLANS.filter((p) => p.available).map((p) => p.id)).toEqual(["free"]);
  });

  it("has a value for every plan in every row, and unique row ids", () => {
    const rows = TABLE.flatMap((g) => g.rows);
    for (const row of rows) expect(Object.keys(row.values).sort(), row.id).toEqual([...PLAN_IDS].sort());
    const ids = rows.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a text for every group and row in the catalog", () => {
    expect(TABLE.map((g) => g.id).sort()).toEqual(Object.keys(MESSAGES.en.pricing.table.groups).sort());
    expect(TABLE.flatMap((g) => g.rows).map((r) => r.id).sort()).toEqual(Object.keys(MESSAGES.en.pricing.table.rows).sort());
  });

  it("has limits that are positive whole numbers or null", () => {
    for (const row of TABLE.flatMap((g) => g.rows)) {
      if (row.kind !== "limit") continue;
      for (const value of Object.values(row.values)) expect(value === null || (Number.isInteger(value) && value > 0)).toBe(true);
    }
  });

  it("formats money and counts with the language", () => {
    expect(formatPrice(9, "en")).toBe("€9");
    expect(formatPrice(29, "pl")).toMatch(/^29\s€$/);
    expect(formatPrice(0, "en")).toBe("€0");
    expect(formatCount(1500, "en")).toBe("1,500");
  });
});
