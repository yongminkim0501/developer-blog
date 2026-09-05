import { notFound } from "next/navigation";
import { allContent, posts } from "@/lib/content";
import Article from "@/components/article";
export function generateStaticParams() {
  return allContent("projects").map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: allContent("projects").find((p) => p.slug === slug)?.title };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = allContent("projects").find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <Article
      post={post}
      related={posts()
        .filter((p) => p.project === slug)
        .slice(0, 3)}
    />
  );
}
