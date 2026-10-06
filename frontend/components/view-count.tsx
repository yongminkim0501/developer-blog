"use client";
import { useEffect, useState } from "react";
import { useServices } from "./providers";
import { visitorId } from "@/lib/visitor";
import { useSiteStats } from "./site-stats";
export default function ViewCount({ slug }: { slug: string }) {
  const { views } = useServices();
  const { refresh } = useSiteStats();
  const [count, setCount] = useState<{ slug: string; value: number } | null>(
    null,
  );
  useEffect(() => {
    if (!views) return;
    const controller = new AbortController();
    const id = visitorId();
    const result = id
      ? views.record(slug, id, controller.signal)
      : views.get(slug, controller.signal);
    result
      .then((response) => {
        if (!controller.signal.aborted && response.success) {
          setCount({ slug, value: response.data.views });
          refresh();
        }
      })
      .catch(() => {
        /* Reading the article remains available if tracking is unavailable. */
      });
    return () => controller.abort();
  }, [slug, views, refresh]);
  if (!views) return null;
  if (!count || count.slug !== slug)
    return (
      <span
        aria-label="조회수"
        title="조회수를 불러오는 중이거나 잠시 연결할 수 없어요."
      >
        조회 —
      </span>
    );
  return (
    <span aria-label="조회수">조회 {count.value.toLocaleString("ko-KR")}</span>
  );
}
