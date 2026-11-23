import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Card } from "./card";

describe("Card", () => {
  it("is a bordered block on the surface colour unless a container sets --card-bg", () => {
    const html = renderToStaticMarkup(<Card>text</Card>);
    expect(html).toContain("bg-(--card-bg,var(--surface))");
    expect(html).toContain("border");
  });

  it("is the element it is told to be", () => {
    expect(renderToStaticMarkup(<Card as="li">x</Card>)).toMatch(/^<li /);
  });
});
