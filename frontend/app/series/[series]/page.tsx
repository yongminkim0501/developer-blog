import { notFound } from "next/navigation";
import Archive from "@/components/archive";
import { posts } from "@/lib/content";
export function generateStaticParams() {
  return [...new Set(posts().flatMap((p) => p.series || []))].map((v) => ({
    series: v,
  }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ series: string }>;
}) {
  return { title: (await params).series };
}
export default async function Page({
  params,
}: {
  params: Promise<{ series: string }>;
}) {
  const value = decodeURIComponent((await params).series);
  const items = posts().filter((p) => p.series === value);
  if (!items.length) notFound();
  return (
    <Archive
      label="SERIES"
      title={value}
      description="하나의 주제로 이어지는 배움의 기록."
      items={items}
      active={value}
    />
  );
}
