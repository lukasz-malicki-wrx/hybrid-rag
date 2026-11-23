"use client";

import { Suspense, type ReactNode } from "react";
import { Sidebar } from "@/features/sidebar/sidebar";
import { useUiStore } from "@/stores/ui-store";
import { MobileHeader } from "./mobile-header";
import { SkipLink } from "./skip-link";

/**
 * The window: no card on a backdrop, the `bg` colour runs edge to edge. From `lg` the sidebar
 * (64px icon rail + 320px column) stands on the left; below it the sidebar is a drawer opened from
 * the mobile header. Views fill `main` with a `Page`.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  return (
    <div className="relative flex h-dvh overflow-hidden bg-bg">
      <SkipLink />
      <Suspense fallback={<div className="hidden w-96 shrink-0 border-r border-border bg-bg lg:block" />}>
        <Sidebar />
      </Suspense>
      {/* While the mobile drawer is open the page behind it is inert. */}
      <div className="flex min-w-0 flex-1 flex-col" inert={sidebarOpen || undefined}>
        <MobileHeader />
        <main id="main" tabIndex={-1} className="relative min-h-0 flex-1 overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
