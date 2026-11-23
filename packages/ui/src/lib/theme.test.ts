import { describe, expect, it } from "vitest";
import { parsePreference, resolveDark, serializePreference, THEME_SCRIPT, THEME_STORAGE_KEY } from "./theme";

describe("resolveDark", () => {
  it("follows the device for system", () => {
    expect(resolveDark("system", true)).toBe(true);
    expect(resolveDark("system", false)).toBe(false);
  });
  it("lets an explicit choice win over the device", () => {
    expect(resolveDark("light", true)).toBe(false);
    expect(resolveDark("dark", false)).toBe(true);
  });
});

describe("the stored preference", () => {
  it("round-trips", () => {
    for (const p of ["light", "dark", "system"] as const) expect(parsePreference(serializePreference(p))).toBe(p);
  });
  it("reads what zustand persist writes", () => {
    expect(parsePreference('{"state":{"preference":"dark"},"version":0}')).toBe("dark");
  });
  it("falls back to system for nothing, junk or an unknown value", () => {
    expect(parsePreference(null)).toBe("system");
    expect(parsePreference("not json")).toBe("system");
    expect(parsePreference('{"state":{"preference":"purple"}}')).toBe("system");
    expect(parsePreference("null")).toBe("system");
  });
});

describe("THEME_SCRIPT", () => {
  it("reads the key the stores write", () => {
    expect(THEME_SCRIPT).toContain(THEME_STORAGE_KEY);
  });
});
