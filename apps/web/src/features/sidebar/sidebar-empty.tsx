import { memo } from "react";

export const SidebarEmpty = memo(function SidebarEmpty({ children }: { children: string }) {
  return <p className="px-1 py-2 text-sm text-muted">{children}</p>;
});
