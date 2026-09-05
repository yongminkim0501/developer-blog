import { notFound } from "next/navigation";
import Archive from "@/components/archive";
import { posts } from "@/lib/content";
export function generateStaticParams() {
  return [...new Set(posts().flatMap((p) => p.category || []))].map((v) => ({
    category: v,
  }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  return { title: (await params).category };
}
export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const value = decodeURIComponent((await params).category);
  const items = posts().filter((p) => p.category === value);
  if (!items.length) notFound();
  return (
    <Archive
      label="CATEGORIES"
      title={value}
      description="하나의 주제로 이어지는 배움의 기록."
      items={items}
      active={value}
    />
  );
}
