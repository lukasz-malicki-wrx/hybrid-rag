"use client";

import { useUiStore } from "@/stores/ui-store";
import { ChatsSection } from "./chats-section";
import { DocumentsSection } from "./documents-section";
import { GroupsSection } from "./groups-section";

/** The list of the selected section (the rail picks it, the route sets it). */
export function SidebarColumn() {
  const section = useUiStore((s) => s.section);
  switch (section) {
    case "groups":
      return <GroupsSection />;
    case "documents":
      return <DocumentsSection />;
    default:
      return <ChatsSection />;
  }
}
