"use client";
import { useEffect, useState } from "react";
import { useServices } from "./providers";

function visitorId(): string | null {
  try {
    const key = "devlog-visitor";
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
    return id;
  } catch {
    return null;
  }
}
export default function ViewCount({ slug }: { slug: string }) {
  const { views } = useServices();
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
        if (!controller.signal.aborted && response.success)
          setCount({ slug, value: response.data.views });
      })
      .catch(() => {
        /* Reading the article remains available if tracking is unavailable. */
      });
    return () => controller.abort();
  }, [slug, views]);
  if (!count || count.slug !== slug) return null;
  return (
    <span aria-label="조회수">조회 {count.value.toLocaleString("ko-KR")}</span>
  );
}
