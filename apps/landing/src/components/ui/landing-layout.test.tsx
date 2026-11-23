import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CtaBand } from "./cta-band";
import { Doodle } from "./doodle";
import { PageHeader } from "./page-header";
import { SplitSection } from "./split-section";
import { StatBand } from "./stat-band";

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe("StatBand", () => {
  it("is a description list: the label is the term and the figure the value", () => {
    const markup = html(<StatBand stats={[{ value: "44", label: "Questions" }, { value: "122", label: "Passages" }]} />);
    expect(markup).toMatch(/^<dl /);
    expect(markup.match(/<dt /g)).toHaveLength(2);
    expect(markup.indexOf("<dt ")).toBeLessThan(markup.indexOf("<dd "));
    expect(markup).toContain("repeat(2, minmax(0, 1fr))");
  });

  it("draws its dividers as 2x40px strokes in the middle of the band, not as full-height borders", () => {
    const markup = html(<StatBand stats={[{ value: "1", label: "A" }, { value: "2", label: "B" }]} />);
    expect(markup).toContain("before:h-10");
    expect(markup).toContain("before:w-0.5");
    expect(markup).not.toMatch(/\bborder-l\b/);
  });

  it("sets the label at the paragraph size", () => {
    expect(html(<StatBand stats={[{ value: "1", label: "A" }]} />)).toMatch(/<dt class="[^"]*text-lead/);
  });
});

describe("CtaBand", () => {
  it("is a region named by its title, with the command in a code element", () => {
    const markup = html(<CtaBand id="cta" title="Try it" text="Text" command="docker compose up">buttons</CtaBand>);
    expect(markup).toContain('aria-labelledby="cta"');
    expect(markup).toMatch(/<h2 [^>]*id="cta"/);
    expect(markup).toContain("<code>docker compose up</code>");
    expect(markup).toContain("on-accent");
  });
});

describe("SplitSection and PageHeader", () => {
  it("puts the picture first on a phone, and on the right of the text by default", () => {
    const markup = html(<SplitSection media={<i>picture</i>}>text</SplitSection>);
    expect(markup).toContain("max-lg:order-first");
    expect(markup).toContain("lg:order-last");
    expect(html(<SplitSection media="m" side="left">t</SplitSection>)).not.toContain("lg:order-last");
  });

  it("has the h1, the accent paragraph and the picture with its doodle when it has media", () => {
    const markup = html(<PageHeader title="Title" lead="Lead" eyebrow="Label" media={<i>picture</i>} />);
    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup).toContain("border-l-2");
    expect(markup).toContain("<i>picture</i>");
    expect(markup).toContain("<svg");
  });

  it("puts the doodle on the outer top corner of the picture: left of a picture on the right, flipped to the right of one on the left", () => {
    const right = html(<SplitSection media="m" doodle>t</SplitSection>);
    const left = html(<SplitSection media="m" side="left" doodle>t</SplitSection>);
    expect(right).toContain("lg:-left-(--doodle-outset)");
    expect(right).not.toContain("-scale-x-100");
    expect(left).toContain("lg:-right-(--doodle-outset)");
    expect(left).toContain("-scale-x-100");
  });

  it("makes the doodle 64px", () => {
    expect(html(<Doodle />)).toContain("size-16");
  });

  it("runs the picture to the screen edges on a phone only when it bleeds, and keeps both columns at the top on request", () => {
    const bleed = html(<SplitSection media="m" bleed>t</SplitSection>);
    expect(bleed).toContain("max-lg:-mx-gutter");
    expect(bleed).toContain("max-lg:aspect-[375/240]");
    expect(bleed).toContain("max-lg:rounded-none");
    expect(html(<SplitSection media="m">t</SplitSection>)).not.toContain("max-lg:-mx-gutter");
    const top = html(<SplitSection media="m" align="top">t</SplitSection>);
    expect(top).toContain("items-start");
    expect(top).toContain("lg:sticky");
    expect(html(<SplitSection media="m">t</SplitSection>)).toContain("items-center");
  });

  it("has a section's space above on every page, and none on a phone when a picture comes first", () => {
    const plain = html(<PageHeader title="T" />);
    expect(plain).toContain("pt-section");
    expect(plain).not.toContain("pt-section-tight");
    const withPicture = html(<PageHeader title="T" media="m" />);
    expect(withPicture).toContain("pt-section");
    expect(withPicture).toContain("max-lg:order-last");
    expect(withPicture).toContain("max-lg:-mx-gutter");
  });

  it("has no picture column and no doodle without media", () => {
    const markup = html(<PageHeader title="Title" />);
    expect(markup).not.toContain("<svg");
    expect(markup).not.toContain("grid-cols-1");
  });
});
