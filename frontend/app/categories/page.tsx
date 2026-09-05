import Link from "next/link";
import { posts } from "@/lib/content";
import { ArrowUpRight } from "lucide-react";
export const metadata = { title: "주제별 기록" };
export default function Page() {
  const all = posts(),
    categories = [...new Set(all.map((p) => p.category))];
  return (
    <main className="shell archive-page">
      <header className="page-heading">
        <span className="eyebrow">EXPLORE BY TOPIC</span>
        <h1>궁금한 곳부터.</h1>
        <p>관심 있는 주제로 기록을 만나보세요.</p>
      </header>
      <div className="topic-list">
        {categories.map((c, i) => (
          <Link key={c} href={`/categories/${encodeURIComponent(c)}`}>
            <small>0{i + 1}</small>
            <h2>{c}</h2>
            <span>{all.filter((p) => p.category === c).length}개의 기록</span>
            <ArrowUpRight />
          </Link>
        ))}
      </div>
      <h2 className="tag-heading">기록을 잇는 키워드</h2>
      <div className="article-tags">
        {[...new Set(all.flatMap((p) => p.tags))].map((t) => (
          <Link href={`/tags/${encodeURIComponent(t)}`} key={t}>
            #{t}
          </Link>
        ))}
      </div>
    </main>
  );
}
