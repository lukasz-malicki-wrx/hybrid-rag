import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GALLERY_AREAS, GALLERY_CARDS } from "./gallery-data";
import { GalleryFilter } from "./gallery-filter";

describe("gallery data", () => {
  it("has a card for every area but the first, and each card in one area", () => {
    for (const area of GALLERY_AREAS.filter((a) => a !== "all")) {
      expect(GALLERY_CARDS.some((card) => card.area === area), area).toBe(true);
    }
    expect(new Set(GALLERY_CARDS.map((card) => card.id)).size).toBe(GALLERY_CARDS.length);
  });
});

describe("GalleryFilter", () => {
  const tabs = GALLERY_AREAS.map((value) => ({ value, label: value }));
  const cards = GALLERY_CARDS.map((card) => ({ id: card.id, area: card.area, node: <li key={card.id}>{card.id}</li> }));
  const markup = renderToStaticMarkup(<GalleryFilter label="Areas" tabs={tabs} cards={cards} />);

  it("renders every card in the HTML, so the page is complete without script", () => {
    for (const card of GALLERY_CARDS) expect(markup).toContain(`<li>${card.id}</li>`);
  });

  it("is a tab list with the first tab selected, controlling a named tab panel", () => {
    expect(markup).toContain('role="tablist"');
    expect(markup.match(/role="tab"/g)).toHaveLength(GALLERY_AREAS.length);
    expect(markup).toMatch(/aria-selected="true"[^>]*aria-controls="([^"]+)"/);
    const panelId = /aria-controls="([^"]+)"/.exec(markup)?.[1];
    expect(markup).toContain(`role="tabpanel" id="${panelId}" aria-label="all"`);
  });

  it("shows the tabs from sm up and, below it, the same areas as a named select (nothing is cut off on a phone)", () => {
    expect(markup).toMatch(/role="tablist"[^>]*class="[^"]*hidden[^"]*sm:flex/);
    expect(markup).toMatch(/<div class="sm:hidden">/);
    expect(markup).toMatch(/<label for="([^"]+)" class="sr-only">Areas<\/label><select id="\1"/);
    expect(markup.match(/<option /g)).toHaveLength(GALLERY_AREAS.length);
    expect(markup).toContain('<option value="all" selected="">all</option>');
  });
});
