import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button, buttonClass } from "./button";

describe("Button", () => {
  it("is a type=button button by default, so that it never submits a form by accident", () => {
    expect(renderToStaticMarkup(<Button>Save</Button>)).toContain('<button type="button"');
  });

  it("lets the caller choose another type", () => {
    expect(renderToStaticMarkup(<Button type="submit">Save</Button>)).toContain('type="submit"');
  });

  it("is a secondary, medium button by default", () => {
    const html = renderToStaticMarkup(<Button>Save</Button>);
    expect(html).toContain("border-border");
    expect(html).toContain("min-h-11");
  });

  it("applies the variant and the size", () => {
    const html = renderToStaticMarkup(
      <Button variant="danger" size="sm">
        Delete
      </Button>,
    );
    expect(html).toContain("bg-danger");
    expect(html).toContain("text-danger-fg");
    expect(html).toContain("min-h-10");
    expect(html).not.toContain("min-h-11");
  });

  it("appends the caller's class name after its own classes", () => {
    const html = renderToStaticMarkup(<Button className="w-full">Save</Button>);
    expect(html).toMatch(/class="[^"]*min-h-11[^"]* w-full"/);
  });

  it("renders the icon before the label", () => {
    const html = renderToStaticMarkup(<Button icon={<svg data-testid="icon" />}>Save</Button>);
    expect(html.indexOf("<svg")).toBeGreaterThan(-1);
    expect(html.indexOf("<svg")).toBeLessThan(html.indexOf("Save"));
  });

  it("passes native attributes through", () => {
    const html = renderToStaticMarkup(<Button disabled>Save</Button>);
    expect(html).toContain("disabled");
  });
});

describe("Button, chip and tile styles", () => {
  it("is a 24px chip on the chip colour, with fg text only", () => {
    const html = renderToStaticMarkup(
      <Button variant="chip" size="xs">
        Copy
      </Button>,
    );
    expect(html).toContain("h-6");
    expect(html).toContain("bg-chip");
    expect(html).toContain("text-fg");
    expect(html).not.toMatch(/min-h-1[01]|text-muted/);
  });

  it("is transparent until hovered in the chip-ghost variant", () => {
    const html = renderToStaticMarkup(<Button variant="chip-ghost" size="field">Scope</Button>);
    expect(html).toContain("hover:bg-chip");
    expect(html).not.toMatch(/ bg-chip/);
  });

  it("is a square icon button in the icon size", () => {
    const html = renderToStaticMarkup(
      <Button variant="primary" size="icon" aria-label="Send">
        x
      </Button>,
    );
    expect(html).toContain("size-10");
    expect(html).toContain('aria-label="Send"');
  });

  it("has no side padding in the text size, for link-looking buttons in a form", () => {
    const html = renderToStaticMarkup(<Button variant="link" size="text">Clear</Button>);
    expect(html).not.toMatch(/\bpx-/);
    expect(html).toContain("text-accent");
  });

  it("gives a link the look of a button through buttonClass", () => {
    const classes = buttonClass({ variant: "tile", size: "tile" });
    expect(classes).toContain("bg-surface");
    expect(classes).toContain("min-h-8");
    expect(classes).toContain("cursor-pointer");
  });

  it("never has two sizes or two backgrounds of its own in one variant and size", () => {
    for (const size of ["md", "sm", "text", "field", "tile", "xs", "icon", "inline"] as const) {
      const classes = buttonClass({ variant: "chip", size }).split(" ");
      expect(classes.filter((c) => /^text-(xs|sm|base)$/.test(c)).length, size).toBeLessThanOrEqual(1);
      expect(classes.filter((c) => /^gap-/.test(c)).length, size).toBeLessThanOrEqual(1);
    }
  });
});

describe("quiet variant", () => {
  it("is muted, takes full colour on hover and marks the current page", () => {
    const classes = buttonClass({ variant: "quiet", size: "sm" });
    expect(classes).toContain("text-muted");
    expect(classes).toContain("hover:text-fg");
    expect(classes).toContain("aria-[current=page]:underline");
    expect(classes).toContain("aria-[current=true]:underline");
    expect(classes).toContain("min-h-10");
  });
});

describe("band variant", () => {
  it("is a fill in the band colour with band text, for the accent band", () => {
    const classes = buttonClass({ variant: "band", size: "md" }).split(" ");
    expect(classes).toEqual(expect.arrayContaining(["bg-band", "text-band-fg"]));
    expect(classes.filter((c) => /^bg-/.test(c))).toHaveLength(1);
  });
});
