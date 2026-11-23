import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AccentParagraph } from "./accent-paragraph";
import { ArrowLink } from "./arrow-link";
import { ContourPattern } from "./contour-pattern";
import { Doodle } from "./doodle";
import { Eyebrow } from "./eyebrow";
import { FeatureCard } from "./feature-card";
import { PageHeader } from "./page-header";
import { Section } from "./section";
import { SectionHeading } from "./section-heading";

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe("decoration", () => {
  it("is hidden from assistive technology and carries no text", () => {
    for (const node of [<Doodle key="d" />, <ContourPattern key="c" />]) {
      const markup = html(node);
      expect(markup).toContain('aria-hidden="true"');
      expect(markup).not.toMatch(/<(title|desc|text)\b/);
    }
  });

  it("keeps the contour pattern small and free of images", () => {
    const file = path.resolve(import.meta.dirname, "contour-pattern.tsx");
    expect(readFileSync(file, "utf8").length).toBeLessThan(4096);
    expect(html(<ContourPattern />)).not.toMatch(/<image|href=|url\(/);
  });

  it("draws the doodle and the contours with the current colour, so a theme or a band can recolour them", () => {
    expect(html(<Doodle />)).toContain('stroke="currentColor"');
    expect(html(<ContourPattern />)).toContain('stroke="currentColor"');
  });
});

describe("Eyebrow and AccentParagraph", () => {
  it("puts a 40x2 dash before the text and hides the dash", () => {
    const markup = html(<Eyebrow>Category</Eyebrow>);
    expect(markup).toMatch(/<span aria-hidden="true" class="[^"]*h-0\.5 w-10[^"]*"><\/span>/);
    expect(markup).toContain("<span>Category</span>");
  });

  it("centres the dash and the text together", () => {
    expect(html(<Eyebrow align="center">x</Eyebrow>)).toContain("justify-center");
    expect(html(<Eyebrow>x</Eyebrow>)).not.toContain("justify-center");
  });

  it("is a paragraph with a line on its left", () => {
    const markup = html(<AccentParagraph>Text</AccentParagraph>);
    expect(markup).toMatch(/^<p /);
    expect(markup).toContain("border-l-2");
  });
});

describe("SectionHeading", () => {
  it("centres its text when asked and uses the eyebrow component", () => {
    const markup = html(<SectionHeading id="x" title="T" eyebrow="E" lead="L" align="center" />);
    expect(markup).toContain("text-center");
    expect(markup).toContain("h-0.5 w-10");
    expect(markup).toMatch(/<h2 [^>]*id="x"/);
  });

  it("is left-aligned by default", () => {
    expect(html(<SectionHeading id="x" title="T" />)).not.toContain("text-center");
  });
});

describe("Section", () => {
  it("has no border in any tone: neighbouring bands are told apart by colour", () => {
    for (const tone of ["plain", "panel"] as const) {
      expect(html(<Section labelledBy="x" tone={tone}>y</Section>)).not.toMatch(/\bborder/);
    }
  });
});

describe("panel sections", () => {
  it("give the cards in them the raised colour, and plain ones leave the card's own", () => {
    expect(html(<Section labelledBy="x" tone="panel">y</Section>)).toContain("surface-panel");
    expect(html(<Section labelledBy="x">y</Section>)).not.toContain("surface-panel");
    expect(html(<PageHeader title="T" />)).toContain("surface-panel");
    const css = readFileSync(path.resolve(import.meta.dirname, "../../app/globals.css"), "utf8");
    expect(css).toMatch(/@utility surface-panel \{[^}]*--card-bg: var\(--color-card-raised\)/);
  });
});

describe("FeatureCard", () => {
  it("is a list item with a decorative icon, a heading, a text and an optional link", () => {
    const markup = html(<FeatureCard icon={<svg />} title="Title" text="Text" link={{ href: "/x", label: "More" }} />);
    expect(markup).toMatch(/^<li /);
    expect(markup).toContain('<h3');
    expect(markup).toContain('href="/x"');
    expect(html(<FeatureCard icon={<svg />} title="Title" text="Text" />)).not.toContain("<a ");
  });
});

describe("ArrowLink", () => {
  it("is a link with an arrow icon that is hidden from assistive technology", () => {
    const markup = html(<ArrowLink href="/x">More</ArrowLink>);
    expect(markup).toContain('href="/x"');
    expect(markup).toMatch(/More<svg[^>]*aria-hidden="true"/);
  });
});
