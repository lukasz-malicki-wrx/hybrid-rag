import type { ScreenshotId } from "@/config/screenshots";

/**
 * The feature groups, in page order: the anchor (`#chat`), the icon, the screenshots shown and the
 * items. The texts are `features.groups.<id>.*` and `features.items.<item>.*`.
 */
export const FEATURE_GROUPS = [
  { id: "chat", icon: "chat", shots: ["chat"], layout: "single", items: ["streaming", "stop", "followUps", "feedback", "labels", "personal"] },
  { id: "sources", icon: "file", shots: ["sources"], layout: "single", items: ["citations", "panel", "searched", "record", "original"] },
  { id: "documents", icon: "group", shots: ["groups"], layout: "single", items: ["upload", "versions", "groups", "favourites", "overview", "softDelete"] },
  { id: "scope", icon: "search", shots: ["start"], layout: "single", items: ["chip", "pinned", "rule", "inGroup"] },
  { id: "quality", icon: "check", shots: ["document", "search-lab"], layout: "pair", items: ["gate", "documentPage", "lab", "modes", "evaluation"] },
  { id: "access", icon: "languages", shots: ["settings", "mobile-chat"], layout: "phone", items: ["languages", "keyboard", "axe", "themes", "phone"] },
] as const satisfies readonly {
  id: string;
  icon: string;
  shots: readonly ScreenshotId[];
  layout: "single" | "pair" | "phone";
  items: readonly string[];
}[];

export type FeatureGroup = (typeof FEATURE_GROUPS)[number];
