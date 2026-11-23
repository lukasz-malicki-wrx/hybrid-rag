import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TextLink } from "./text-link";

describe("TextLink", () => {
  it("is an underlined link in running text by default", () => {
    const html = renderToStaticMarkup(<TextLink href="/faq">FAQ</TextLink>);
    expect(html).toContain('href="/faq"');
    expect(html).toContain("underline");
  });

  it("has a quiet variant for lists of links, with a 24px target", () => {
    const html = renderToStaticMarkup(
      <TextLink href="/faq" variant="quiet">
        FAQ
      </TextLink>,
    );
    expect(html).toContain("text-muted");
    expect(html).toContain("min-h-6");
    expect(html).not.toContain("decoration-2");
  });

  it("has a band variant in the colours of the dark band, and an arrow variant that keeps its surroundings' colour", () => {
    const band = renderToStaticMarkup(<TextLink href="/x" variant="band">x</TextLink>);
    expect(band).toContain("text-band-muted");
    expect(band).not.toContain("text-muted");
    const arrow = renderToStaticMarkup(<TextLink href="/x" variant="arrow">x</TextLink>);
    expect(arrow).toContain("gap-2");
    expect(arrow).not.toMatch(/text-(fg|muted|band|accent)/);
  });

  it("renders the given router link component", () => {
    const Router = ({ href, className, children }: { href: string; className?: string; children?: ReactNode }) => (
      <a data-router="yes" href={href} className={className}>
        {children}
      </a>
    );
    expect(renderToStaticMarkup(<TextLink href="/x" as={Router}>x</TextLink>)).toContain('data-router="yes"');
  });
});
