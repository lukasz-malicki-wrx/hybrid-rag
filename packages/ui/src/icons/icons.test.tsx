import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as icons from "./index";

describe("icons", () => {
  it.each(Object.entries(icons).filter(([name]) => name.endsWith("Icon")))("%s is decorative", (_name, Component) => {
    const html = renderToStaticMarkup(<Component />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('focusable="false"');
    expect(html).toMatch(/<(path|rect|circle)/);
  });

  it("passes size, classes and other attributes to the glyph", () => {
    const html = renderToStaticMarkup(<icons.FileIcon width={12} height={12} className="text-muted" data-x="1" />);
    expect(html).toContain('width="12"');
    expect(html).toContain('height="12"');
    expect(html).toContain("text-muted");
    expect(html).toContain('data-x="1"');
  });

  it("keeps the spinner's animation when a class is added", () => {
    expect(renderToStaticMarkup(<icons.SpinnerIcon className="text-accent" />)).toMatch(/animate-spin.*text-accent/);
  });

  it("fills the star only when it is on", () => {
    expect(renderToStaticMarkup(<icons.StarIcon filled />)).toContain('fill="currentColor"');
    expect(renderToStaticMarkup(<icons.StarIcon />)).toContain('fill="none"');
  });

  it("has the icons of the chat frame", () => {
    for (const name of [
      "SmileIcon", "FrownIcon", "CopyIcon", "RefreshIcon", "MoonIcon", "SunIcon", "UserIcon", "BoltIcon", "ArrowRightIcon",
    ]) {
      expect(icons, name).toHaveProperty(name);
    }
  });
});
