import Link from "next/link";
import { posts } from "@/lib/content";
import { PostGrid } from "@/components/post-card";
export const metadata = { title: "정글 기록" };
export default function Page() {
  const all = posts().filter((p) => p.project === "krafton-jungle"),
    weeks = [...new Set(all.map((p) => p.week))]
      .filter((w): w is number => typeof w === "number")
      .sort((a, b) => a - b);
  return (
    <main className="shell archive-page">
      <header className="page-heading">
        <span className="eyebrow">KRAFTON JUNGLE</span>
        <h1>
          깊이 몰입하고,
          <br />
          함께 성장하는 시간.
        </h1>
        <p>알고리즘부터 시스템까지. 정글에서 공부한 것들을 모았습니다.</p>
      </header>
      {weeks.map((w) => (
        <section className="week-section" key={w}>
          <div className="section-heading">
            <h2>
              <span className="week-number">
                WEEK {String(w).padStart(2, "0")}
              </span>
            </h2>
            <Link href={`/jungle/${w}`}>주차별 기록 ↗</Link>
          </div>
          <PostGrid items={all.filter((p) => p.week === w)} />
        </section>
      ))}
    </main>
  );
}
