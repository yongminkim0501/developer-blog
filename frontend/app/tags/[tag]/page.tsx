import { notFound } from "next/navigation";
import Archive from "@/components/archive";
import { posts } from "@/lib/content";
export function generateStaticParams() {
  return [...new Set(posts().flatMap((p) => p.tags || []))].map((v) => ({
    tag: v,
  }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  return { title: (await params).tag };
}
export default async function Page({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const value = decodeURIComponent((await params).tag);
  const items = posts().filter((p) => p.tags.includes(value));
  if (!items.length) notFound();
  return (
    <Archive
      label="TAGS"
      title={value}
      description="하나의 주제로 이어지는 배움의 기록."
      items={items}
      active={value}
    />
  );
}
