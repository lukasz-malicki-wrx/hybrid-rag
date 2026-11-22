import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
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
});
