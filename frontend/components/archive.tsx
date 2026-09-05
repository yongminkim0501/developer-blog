import Link from "next/link";
import type { Post } from "@/types";
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
          ["Operating System", "/categories/Operating%20System"],
          ["Backend", "/categories/Backend"],
          ["Dev Log", "/categories/Dev%20Log"],
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
