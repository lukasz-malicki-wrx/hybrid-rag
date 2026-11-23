import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BarHeader } from "./bar-header";
import { Heading } from "./heading";

describe("BarHeader", () => {
  it("is a static 64px bar, not an overlay", () => {
    const html = renderToStaticMarkup(<BarHeader>Title</BarHeader>);
    expect(html).toContain("h-16");
    expect(html).not.toMatch(/sticky|fixed|-mb-|backdrop-blur/);
  });

  it("renders the subtitle and the actions", () => {
    const html = renderToStaticMarkup(
      <BarHeader subtitle="3 documents" actions={<button>Go</button>}>
        <Heading level={1} size="bar">
          Title
        </Heading>
      </BarHeader>,
    );
    expect(html).toMatch(/<h1 [^>]*>Title<\/h1>/);
    expect(html).toContain("3 documents");
    expect(html).toContain("<button>Go</button>");
  });

  it("has no subtitle line without a subtitle", () => {
    expect(renderToStaticMarkup(<BarHeader>Title</BarHeader>)).not.toContain("text-muted");
  });
});
