import { notFound } from "next/navigation";
import { posts } from "@/lib/content";
import Article from "@/components/article";
export function generateStaticParams() {
  return posts().map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts().find((p) => p.slug === slug);
  return { title: post?.title, description: post?.description };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const all = posts(),
    index = all.findIndex((p) => p.slug === slug),
    post = all[index];
  if (!post) notFound();
  return (
    <Article
      post={post}
      related={all
        .filter(
          (p) =>
            p.slug !== slug &&
            (p.category === post.category ||
              p.tags.some((t) => post.tags.includes(t))),
        )
        .slice(0, 3)}
      previous={all[index + 1]}
      next={all[index - 1]}
    />
  );
}
