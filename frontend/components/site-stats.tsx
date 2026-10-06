"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { visitorId } from "@/lib/visitor";
import type { SiteStats, StatsService } from "@/types";

const StatsContext = createContext<{
  stats: SiteStats | null;
  enabled: boolean;
  refresh: () => void;
}>({ stats: null, enabled: false, refresh: () => {} });

export function useSiteStats() {
  return useContext(StatsContext);
}

export function SiteStatsProvider({
  service,
  children,
}: {
  service: StatsService | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [stats, setStats] = useState<SiteStats | null>(null);
  const active = useRef<AbortController | null>(null);
  const update = useCallback(
    (record: boolean) => {
      if (!service) return;
      active.current?.abort();
      const controller = new AbortController();
      active.current = controller;
      const id = record ? visitorId() : null;
      const result = id
        ? service.record(id, controller.signal)
        : service.get(controller.signal);
      void result
        .then((response) => {
          if (!controller.signal.aborted)
            setStats(response.success ? response.data : null);
        })
        .catch(() => {
          if (!controller.signal.aborted) setStats(null);
        });
    },
    [service],
  );
  const refresh = useCallback(() => update(true), [update]);
  useEffect(() => {
    update(true);
    // Returning to a tab also updates the date after midnight in Korea.
    const onVisible = () => {
      if (document.visibilityState === "visible") update(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active.current?.abort();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname, update]);
  return (
    <StatsContext.Provider
      value={{ stats, enabled: service !== null, refresh }}
    >
      {children}
    </StatsContext.Provider>
  );
}

export function CardViewCount({ slug }: { slug: string }) {
  const { stats, enabled } = useSiteStats();
  if (!enabled) return null;
  const count = stats?.postViews[slug];
  return (
    <span
      className="card-view-count"
      aria-label="조회수"
      title={count === undefined ? "조회수를 불러오지 못했어요." : undefined}
    >
      조회 {count === undefined ? "—" : count.toLocaleString("ko-KR")}
    </span>
  );
}

export default function SiteStatsFooter() {
  const { stats, enabled } = useSiteStats();
  if (!enabled) return null;
  const format = (value: number | undefined) =>
    value === undefined ? "—" : value.toLocaleString("ko-KR");
  return (
    <div className="site-stats" role="group" aria-label="블로그 방문 통계">
      <dl>
        <div>
          <dt>오늘 방문</dt>
          <dd>{format(stats?.todayVisitors)}</dd>
        </div>
        <div>
          <dt>누적 방문</dt>
          <dd>{format(stats?.totalVisitors)}</dd>
        </div>
        <div>
          <dt>전체 조회</dt>
          <dd>{format(stats?.totalViews)}</dd>
        </div>
      </dl>
      <p>
        {stats
          ? "한국 시간 기준 · 누적 방문은 일별 방문 수의 합계입니다."
          : "통계를 불러오는 중이거나 잠시 연결할 수 없어요."}
      </p>
    </div>
  );
}
