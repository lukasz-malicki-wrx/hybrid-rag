"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { LangAttribute } from "./lang-attribute";
import { ThemeAttribute } from "./theme-attribute";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 10_000, refetchOnWindowFocus: false, retry: 1 } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <LangAttribute />
      <ThemeAttribute />
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
