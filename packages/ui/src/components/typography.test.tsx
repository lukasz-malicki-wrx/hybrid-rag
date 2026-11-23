import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";
import { Heading } from "./heading";
import { Highlighted } from "./highlighted";
import { Text } from "./text";

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

describe("Heading size bar", () => {
  it("is the 20px bold title of a pane bar", () => {
    const html = renderToStaticMarkup(<Heading size="bar">Chats</Heading>);
    expect(html).toContain("text-xl");
    expect(html).toContain("font-bold");
  });
});

describe("Heading sizes title and caption", () => {
  it("title is 16px bold and caption 14px medium", () => {
    const title = renderToStaticMarkup(<Heading size="title">T</Heading>);
    expect(title).toContain("text-base");
    expect(title).toContain("font-bold");
    const caption = renderToStaticMarkup(<Heading size="caption">C</Heading>);
    expect(caption).toContain("text-sm");
    expect(caption).toContain("font-medium");
  });
});

describe("Heading landing sizes and Text lead", () => {
  it("has the h1-h3 sizes, and allows level 4", () => {
    for (const size of ["h1", "h2", "h3"] as const) {
      expect(renderToStaticMarkup(<Heading size={size}>T</Heading>)).toContain(`text-${size}`);
    }
    expect(renderToStaticMarkup(<Heading level={4}>T</Heading>)).toMatch(/^<h4 /);
  });

  it("has a lead size", () => {
    expect(renderToStaticMarkup(<Text size="lead">T</Text>)).toContain("text-lead");
  });
});

describe("Text", () => {
  it("is a paragraph by default and can be a term, a description, a caption, a div or a span", () => {
    expect(renderToStaticMarkup(<Text>T</Text>)).toMatch(/^<p /);
    for (const as of ["span", "div", "dt", "dd", "figcaption"] as const) {
      expect(renderToStaticMarkup(<Text as={as}>T</Text>), as).toMatch(new RegExp(`^<${as} .*>T</${as}>$`));
    }
  });

  it("has the landing sizes and the band tones", () => {
    expect(renderToStaticMarkup(<Text size="eyebrow">T</Text>)).toContain("text-eyebrow");
    const stat = renderToStaticMarkup(<Text size="stat">T</Text>);
    expect(stat).toContain("text-stat");
    expect(stat).toContain("tabular-nums");
    expect(renderToStaticMarkup(<Text tone="band-muted">T</Text>)).toContain("text-band-muted");
    expect(renderToStaticMarkup(<Text tone="accent-fg">T</Text>)).toContain("text-accent-fg");
  });
});
