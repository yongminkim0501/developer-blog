import Link from "next/link";
import type { Post } from "@/types";
import { dateLabel, postUrl } from "@/lib/content";
import { ArrowUpRight } from "lucide-react";
export function PostCard({
  post,
  large = false,
}: {
  post: Post;
  large?: boolean;
}) {
  return (
    <article className={`post-card ${large ? "large" : ""}`}>
      <Link
        href={postUrl(post)}
        className="cover-link"
        tabIndex={-1}
        aria-hidden="true"
      >
        {post.thumbnail ? (
          <img src={post.thumbnail} alt="" className="post-cover" />
        ) : (
          <div className="fallback-cover">{post.category}</div>
        )}
        <span className="cover-arrow">
          <ArrowUpRight size={22} />
        </span>
      </Link>
      <div className="post-category">
        {post.category}
        {post.demo && <span>샘플 기록</span>}
      </div>
      <h3>
        <Link href={postUrl(post)}>{post.title}</Link>
      </h3>
      <p>{post.description}</p>
      <div className="post-meta">
        {dateLabel(post.date)}
        <span>·</span>
        {post.readingTime}분 읽기
      </div>
    </article>
  );
}
export function PostGrid({ items }: { items: Post[] }) {
  return items.length ? (
    <div className="post-grid">
      {items.map((p) => (
        <PostCard key={p.slug} post={p} />
      ))}
    </div>
  ) : (
    <p className="empty-state">
      아직 공개된 기록이 없어요. 다음 이야기를 준비하고 있습니다.
    </p>
  );
}
