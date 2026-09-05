"use client";
import { ThemeProvider } from "next-themes";
import { createContext, useContext, useMemo } from "react";
import { createMockServices } from "@/lib/api/mock";
import { httpSearch, httpViews } from "@/lib/api/http";
import type {
  SearchItem,
  SearchService,
  ChatService,
  ViewService,
} from "@/types";
const Services = createContext<{
  search: SearchService;
  chat: ChatService;
  views: ViewService | null;
} | null>(null);
export function useServices() {
  const value = useContext(Services);
  if (!value) throw new Error("Missing services");
  return value;
}
export function Providers({
  children,
  items,
}: {
  children: React.ReactNode;
  items: SearchItem[];
}) {
  const services = useMemo(() => {
    const mock = createMockServices(items);
    if (process.env.NEXT_PUBLIC_DATA_MODE === "mock")
      return { ...mock, views: null };
    return { search: httpSearch, chat: mock.chat, views: httpViews };
  }, [items]);
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Services.Provider value={services}>{children}</Services.Provider>
    </ThemeProvider>
  );
}
