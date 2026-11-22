import { memo } from "react";

export const SidebarEmpty = memo(function SidebarEmpty({ children }: { children: string }) {
  return <p className="px-2 py-1 text-sm text-muted">{children}</p>;
});
