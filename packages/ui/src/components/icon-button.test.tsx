import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { tileClass } from "../lib/tile";
import { IconButton } from "./icon-button";

const icon = <svg />;

describe("IconButton", () => {
  it("is named by its label", () => {
    const html = renderToStaticMarkup(<IconButton label="Delete" icon={icon} />);
    expect(html).toContain('aria-label="Delete"');
    expect(html).toContain('type="button"');
  });

  it("does not expose a pressed state unless it is a toggle", () => {
    expect(renderToStaticMarkup(<IconButton label="Star" icon={icon} />)).not.toMatch(/ aria-pressed=/);
  });

  it("exposes the state of a toggle", () => {
    expect(renderToStaticMarkup(<IconButton label="Star" icon={icon} pressed />)).toContain('aria-pressed="true"');
    expect(renderToStaticMarkup(<IconButton label="Star" icon={icon} pressed={false} />)).toContain(
      'aria-pressed="false"',
    );
  });

  it("turns red on hover only for the danger tone", () => {
    expect(renderToStaticMarkup(<IconButton label="Delete" icon={icon} tone="danger" />)).toContain(
      "hover:text-danger",
    );
    expect(renderToStaticMarkup(<IconButton label="Delete" icon={icon} />)).not.toContain("hover:text-danger");
  });

  it("is a bare padded icon by default", () => {
    const html = renderToStaticMarkup(<IconButton label="Delete" icon={icon} />);
    expect(html).toContain("p-2");
    expect(html).not.toContain("size-8");
  });

  it("is a 32px tile on a surface in the tile variant, still named and toggleable", () => {
    const html = renderToStaticMarkup(<IconButton label="Star" icon={icon} variant="tile" pressed />);
    expect(html).toContain("size-8");
    expect(html).toContain("bg-surface");
    expect(html).not.toContain("p-2");
    expect(html).toContain('aria-label="Star"');
    expect(html).toContain('aria-pressed="true"');
  });
});

describe("IconButton variants", () => {
  it("is a 32px accent tile with its own hover, not a surface tile", () => {
    const html = renderToStaticMarkup(<IconButton label="New" icon={icon} variant="accent" />);
    expect(html).toContain("size-8");
    expect(html).toContain("bg-accent");
    expect(html).toContain("text-accent-fg");
    expect(html).toContain("hover:opacity-90");
    // Nothing that would fight bg-accent: cn does not resolve conflicting utilities.
    expect(html).not.toMatch(/bg-surface|text-muted|hover:bg-surface-2/);
  });

  it("is the same tile for a link, through tileClass", () => {
    const button = /class="([^"]+)"/.exec(renderToStaticMarkup(<IconButton label="New" icon={icon} variant="accent" />))?.[1];
    expect(button).toBe(tileClass("accent"));
  });

  it("has less padding when compact, without a second padding class", () => {
    const html = renderToStaticMarkup(<IconButton label="Remove" icon={icon} variant="compact" />);
    expect(html).toContain("p-1.5");
    expect(html).not.toContain("p-2");
  });

  it("has one text colour per tone", () => {
    const colours = (html: string) => (/class="([^"]+)"/.exec(html)?.[1] ?? "").split(" ").filter((c) => /^text-(muted|fg)$/.test(c));
    expect(colours(renderToStaticMarkup(<IconButton label="Menu" icon={icon} tone="strong" />))).toEqual(["text-fg"]);
    expect(colours(renderToStaticMarkup(<IconButton label="Menu" icon={icon} />))).toEqual(["text-muted"]);
    expect(colours(renderToStaticMarkup(<IconButton label="Menu" icon={icon} variant="tile" />))).toEqual(["text-muted"]);
  });

  it("turns a danger tile red on hover without a second hover colour", () => {
    const html = renderToStaticMarkup(<IconButton label="Delete" icon={icon} variant="tile" tone="danger" />);
    expect(html).toContain("hover:text-danger");
    expect(html).not.toContain("hover:text-fg");
  });
});
