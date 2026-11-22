import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";
import { Heading } from "./heading";
import { Highlighted } from "./highlighted";

describe("Heading", () => {
  it("is an h2 by default", () => {
    expect(renderToStaticMarkup(<Heading>Title</Heading>)).toMatch(/^<h2 /);
  });

  it.each([1, 2, 3] as const)("renders level %i as that heading element", (level) => {
    const html = renderToStaticMarkup(<Heading level={level}>Title</Heading>);
    expect(html).toMatch(new RegExp(`^<h${level} .*>Title</h${level}>$`));
  });

  it("keeps the caller's class name and attributes", () => {
    const html = renderToStaticMarkup(
      <Heading id="title" className="truncate">
        Title
      </Heading>,
    );
    expect(html).toContain('id="title"');
    expect(html).toContain("truncate");
  });
});

describe("Badge", () => {
  it("is neutral by default", () => {
    const html = renderToStaticMarkup(<Badge>Stopped</Badge>);
    expect(html).toContain("bg-surface-2");
    expect(html).toContain(">Stopped</span>");
  });

  it("uses the warning colours for the warn tone", () => {
    const html = renderToStaticMarkup(<Badge tone="warn">Short</Badge>);
    expect(html).toContain("bg-warn-bg");
    expect(html).toContain("text-warn-fg");
  });

  it("renders the icon before the text", () => {
    const html = renderToStaticMarkup(<Badge icon={<svg />}>Short</Badge>);
    expect(html.indexOf("<svg")).toBeLessThan(html.indexOf("Short"));
  });
});

describe("Highlighted", () => {
  it("marks every match and keeps the original case", () => {
    const html = renderToStaticMarkup(<Highlighted text="Back-ups and BACK-UPS" needle="back-ups" />);
    expect(html.match(/<mark /g)).toHaveLength(2);
    expect(html).toContain(">Back-ups</mark>");
    expect(html).toContain(">BACK-UPS</mark>");
  });

  it("uses the mark colours from the design tokens", () => {
    const html = renderToStaticMarkup(<Highlighted text="abc" needle="b" />);
    expect(html).toContain("bg-mark");
    expect(html).toContain("text-mark-fg");
  });

  it("renders plain text when nothing matches", () => {
    expect(renderToStaticMarkup(<Highlighted text="abc" needle="x" />)).toBe("abc");
    expect(renderToStaticMarkup(<Highlighted text="abc" needle="" />)).toBe("abc");
  });

  it("escapes the text", () => {
    expect(renderToStaticMarkup(<Highlighted text="<b>a</b>" needle="a" />)).not.toContain("<b>");
  });
});
