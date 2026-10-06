"use client";
import { ThemeProvider } from "next-themes";
import { createContext, useContext, useMemo } from "react";
import { createMockServices } from "@/lib/api/mock";
import { httpSearch, httpViews, httpStats } from "@/lib/api/http";
import { SiteStatsProvider } from "./site-stats";
import type {
  SearchItem,
  SearchService,
  ViewService,
  StatsService,
} from "@/types";
const Services = createContext<{
  search: SearchService;
  views: ViewService | null;
  stats: StatsService | null;
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
      return { ...mock, views: null, stats: null };
    return { search: httpSearch, views: httpViews, stats: httpStats };
  }, [items]);
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Services.Provider value={services}>
        <SiteStatsProvider service={services.stats}>
          {children}
        </SiteStatsProvider>
      </Services.Provider>
    </ThemeProvider>
  );
}
