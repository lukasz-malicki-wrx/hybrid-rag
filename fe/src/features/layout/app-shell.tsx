"use client";

import { Suspense, type ReactNode } from "react";
import { Sidebar } from "@/features/sidebar/sidebar";
import { useUiStore } from "@/stores/ui-store";
import { MobileHeader } from "./mobile-header";
import { SkipLink } from "./skip-link";

export function AppShell({ children }: { children: ReactNode }) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  return (
    <div className="relative flex h-dvh overflow-hidden">
      <SkipLink />
      <Suspense fallback={<div className="hidden w-72 shrink-0 border-r border-border bg-surface md:block" />}>
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
