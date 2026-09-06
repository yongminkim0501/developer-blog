import Link from "next/link";
import type { Post } from "@/types";
import { posts } from "@/lib/content";
import { PostGrid } from "./post-card";
export default function Archive({
  label,
  title,
  description,
  items,
  active,
}: {
  label: string;
  title: string;
  description: string;
  items: Post[];
  active?: string;
}) {
  const categories = [...new Set(posts().map((p) => p.category))];
  return (
    <main className="shell archive-page">
      <header className="page-heading">
        <span className="eyebrow">{label}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <nav className="category-nav" aria-label="주제 필터">
        {[
          ["전체", "/blog"],
          ...categories.map(
            (c) => [c, `/categories/${encodeURIComponent(c)}`] as const,
          ),
        ].map(([name, url]) => (
          <Link
            key={url}
            className={
              active === name || (!active && name === "전체") ? "active" : ""
            }
            href={url}
          >
            {name}
          </Link>
        ))}
        <Link href="/categories">모든 주제 ↗</Link>
      </nav>
      <div className="archive-count">
        {items.length}개의 기록 <span>최신순</span>
      </div>
      <PostGrid items={items} />
    </main>
  );
}
