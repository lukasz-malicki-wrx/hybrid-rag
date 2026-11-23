import type { ScreenshotId } from "@/config/screenshots";

/** The tabs of the gallery: everything, then an area each. */
export const GALLERY_AREAS = ["all", "chat", "sources", "documents", "quality"] as const;
export type GalleryArea = (typeof GALLERY_AREAS)[number];
export type GalleryCardArea = Exclude<GalleryArea, "all">;

/**
 * The cards of the gallery, in order: `id` is the translation key (`home.gallery.cards.<id>`), `area`
 * the tab that shows it, `group` the part of the features page it links to.
 */
export const GALLERY_CARDS = [
  { id: "chat", shot: "chat", area: "chat", group: "chat" },
  { id: "start", shot: "start", area: "chat", group: "scope" },
  { id: "sources", shot: "sources", area: "sources", group: "sources" },
  { id: "groups", shot: "groups", area: "documents", group: "documents" },
  { id: "document", shot: "document", area: "quality", group: "quality" },
  { id: "searchLab", shot: "search-lab", area: "quality", group: "quality" },
] as const satisfies readonly { id: string; shot: ScreenshotId; area: GalleryCardArea; group: string }[];
