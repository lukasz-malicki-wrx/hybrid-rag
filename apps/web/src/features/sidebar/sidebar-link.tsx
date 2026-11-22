"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, type ReactNode } from "react";
import { cn } from "@hybrid-rag/ui/cn";
import { AnsweringIndicator } from "@/features/chat/answering-indicator";

export const SidebarLink = memo(function SidebarLink({
  href,
  icon,
  children,
  meta,
  answering,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  meta?: ReactNode;
  /** The assistant is answering in this conversation right now. */
  answering?: boolean;
}) {
  const active = usePathname() === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-busy={answering || undefined}
      className={cn(
        "flex min-h-9 items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-fg hover:bg-surface-2",
        active && "bg-surface-2 font-medium",
        answering && "ai-active",
      )}
    >
      <span className="shrink-0 text-muted">{answering ? <AnsweringIndicator /> : icon}</span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {meta}
    </Link>
  );
});
