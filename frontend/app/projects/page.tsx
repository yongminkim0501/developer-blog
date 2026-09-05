import Link from "next/link";
import { allContent } from "@/lib/content";
import { ArrowUpRight } from "lucide-react";
export const metadata = { title: "프로젝트" };
export default function Page() {
  return (
    <main className="shell archive-page">
      <header className="page-heading">
        <span className="eyebrow">SELECTED PROJECTS</span>
        <h1>생각에서, 실제로.</h1>
        <p>직접 만들고 부딪히며 배운 것들. 결과 너머의 과정을 소개합니다.</p>
      </header>
      <div className="project-list">
        {allContent("projects").map((p, i) => (
          <Link href={`/projects/${p.slug}`} key={p.slug}>
            <div className="project-list-image">
              <img src={p.thumbnail} alt="" />
            </div>
            <div>
              <span className="eyebrow">
                PROJECT 0{i + 1} ·{" "}
                {p.status === "in-progress" ? "만드는 중" : "완료"}
              </span>
              <h2>{p.title}</h2>
              <p>{p.description}</p>
              <div className="tech-list">
                {p.tech?.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <span className="project-more">
                프로젝트 이야기 <ArrowUpRight size={20} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
