import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ThemePill } from "./theme-pill";

const render = (props: Partial<Parameters<typeof ThemePill>[0]> = {}) =>
  renderToStaticMarkup(<ThemePill dark={false} label="Switch to dark theme" onToggle={() => {}} {...props} />);

describe("ThemePill", () => {
  it("is a button named by its label", () => {
    const html = render();
    expect(html).toContain('<button type="button" aria-label="Switch to dark theme"');
  });

  it("is vertical (32x56) by default, for the app's rail", () => {
    const html = render();
    expect(html).toContain("h-14 w-8 flex-col");
    expect(html).toContain('data-orientation="vertical"');
  });

  it("can be horizontal (56x32), for a header bar", () => {
    const html = render({ orientation: "horizontal" });
    expect(html).toContain("h-8 w-14 flex-row");
    expect(html).not.toContain("h-14");
  });

  it("moves the thumb along its own axis for light, and not for dark", () => {
    expect(render()).toContain("translate-y-[28px]");
    expect(render({ orientation: "horizontal" })).toContain("translate-x-[28px]");
    expect(render({ dark: true })).not.toContain("translate-");
    expect(render({ dark: true, orientation: "horizontal" })).not.toContain("translate-");
  });
});
