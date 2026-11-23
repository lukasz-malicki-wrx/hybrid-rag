import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SearchField } from "./search-field";

describe("SearchField", () => {
  it("is labelled by a visually hidden label", () => {
    const html = renderToStaticMarkup(<SearchField label="Search chats" />);
    const labelFor = /<label for="([^"]+)"/.exec(html)?.[1];
    expect(labelFor).toBeTruthy();
    expect(html).toContain(`id="${labelFor}"`);
    expect(html).toMatch(/<label[^>]*class="sr-only"[^>]*>Search chats<\/label>/);
  });

  it("is a search input and hides its icon from assistive technology", () => {
    const html = renderToStaticMarkup(<SearchField label="Search" />);
    expect(html).toContain('type="search"');
    expect(html).toContain('aria-hidden="true"');
  });

  it("passes native attributes through, and the class goes to the wrapper", () => {
    const html = renderToStaticMarkup(
      <SearchField label="Search" placeholder="Find" value="abc" onChange={() => {}} className="w-full" />,
    );
    expect(html).toContain('placeholder="Find"');
    expect(html).toContain('value="abc"');
    expect(html).toMatch(/^<div class="relative w-full"/);
  });
});
