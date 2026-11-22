import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

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
