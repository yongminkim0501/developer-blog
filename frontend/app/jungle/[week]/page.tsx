import { notFound } from "next/navigation";
import Archive from "@/components/archive";
import { posts } from "@/lib/content";
export function generateStaticParams() {
  return [
    ...new Set(
      posts()
        .filter((p) => p.project === "krafton-jungle" && p.week)
        .map((p) => String(p.week)),
    ),
  ].map((week) => ({ week }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week } = await params;
  const items = posts().filter(
    (p) => p.project === "krafton-jungle" && String(p.week) === week,
  );
  if (!items.length) notFound();
  return (
    <Archive
      label="KRAFTON JUNGLE"
      title={`Week ${week.padStart(2, "0")}`}
      description={items[0].series || "이번 주에 배우고 이해한 것들."}
      items={items}
    />
  );
}
