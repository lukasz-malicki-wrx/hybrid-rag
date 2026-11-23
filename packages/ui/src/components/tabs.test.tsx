import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { nextTabIndex, Tabs } from "./tabs";

const tabs = [
  { value: "chats", label: "Chats" },
  { value: "saved", label: "Saved", count: 3 },
] as const;

const render = (value: "chats" | "saved", panelId?: string) =>
  renderToStaticMarkup(<Tabs label="Lists" tabs={tabs} value={value} onChange={() => {}} panelId={panelId} />);

describe("Tabs", () => {
  it("is a named tab list of tabs", () => {
    const html = render("chats");
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-label="Lists"');
    expect(html.match(/role="tab"/g)).toHaveLength(2);
  });

  it("marks only the selected tab as selected and as the one tab stop", () => {
    const html = render("saved");
    const [chats, saved] = html.split('role="tab"').slice(1);
    expect(chats).toContain('aria-selected="false"');
    expect(chats).toContain('tabindex="-1"');
    expect(saved).toContain('aria-selected="true"');
    expect(saved).toContain('tabindex="0"');
  });

  it("shows the count next to the label", () => {
    expect(render("chats")).toMatch(/Saved<\/span><span[^>]*>3<\/span>/);
  });

  it("points the selected tab at its panel", () => {
    const html = render("chats", "list");
    expect(html.match(/aria-controls="list"/g)).toHaveLength(1);
  });

  it("gives every tab its own id", () => {
    const ids = [...render("chats").matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(2);
  });
});

describe("nextTabIndex", () => {
  it("moves with the arrows and wraps around", () => {
    expect(nextTabIndex("ArrowRight", 0, 3)).toBe(1);
    expect(nextTabIndex("ArrowRight", 2, 3)).toBe(0);
    expect(nextTabIndex("ArrowLeft", 0, 3)).toBe(2);
    expect(nextTabIndex("ArrowDown", 1, 3)).toBe(2);
    expect(nextTabIndex("ArrowUp", 1, 3)).toBe(0);
  });

  it("jumps with Home and End", () => {
    expect(nextTabIndex("Home", 2, 3)).toBe(0);
    expect(nextTabIndex("End", 0, 3)).toBe(2);
  });

  it("ignores other keys", () => {
    expect(nextTabIndex("Enter", 0, 3)).toBeNull();
    expect(nextTabIndex("a", 0, 3)).toBeNull();
  });
});
