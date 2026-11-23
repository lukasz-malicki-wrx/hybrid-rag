import type { Section } from "@/stores/ui-store";

/**
 * The sidebar section a route belongs to: `/g/*` groups, `/d/*` documents, `/` and `/c/*` chats.
 * Other routes (the search lab, not-found) belong to none, so the column keeps what it shows.
 */
export function sectionForPath(pathname: string): Section | null {
  const first = pathname.split("/")[1] ?? "";
  switch (first) {
    case "":
    case "c":
      return "chats";
    case "g":
      return "groups";
    case "d":
      return "documents";
    default:
      return null;
  }
}

/** The search lab has its own item in the rail instead of a section. */
export function isSearchLabPath(pathname: string): boolean {
  return pathname === "/search" || pathname.startsWith("/search/");
}
