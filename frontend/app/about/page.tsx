import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export const metadata = { title: "소개" };
export default function Page() {
  return (
    <main className="shell about-page">
      <header className="page-heading">
        <span className="eyebrow">HELLO, I’M YONGMIN</span>
        <h1>
          어떻게보다,
          <br />왜 그런지 궁금합니다.
        </h1>
        <p>배우고 만들면서 이해한 것들을 기록하는 개발자입니다.</p>
      </header>
      <div className="about-grid">
        <div className="about-visual">
          <span>
            STAY
            <br />
            CURIOUS<span className="logo-dot">.</span>
          </span>
          <i>✳</i>
          <small>LEARN. BUILD. DOCUMENT. REPEAT.</small>
        </div>
        <div className="about-copy">
          <span className="eyebrow">BEHIND THE NOTES</span>
          <h2>기록하며 한 걸음씩.</h2>
          <p>
            이곳은 크래프톤 정글의 학습 기록, 기술을 공부하며 생긴 궁금증, 직접
            만든 프로젝트의 과정을 모으는 공간입니다.
          </p>
          <p>
            정답만 정리하기보다 막혔던 지점과 생각이 바뀐 순간도 함께 남기려
            합니다. 오늘의 작은 이해가 다음 도전의 바탕이 되기를 바라면서요.
          </p>
          <div className="about-interests">
            <span>Backend</span>
            <span>Systems</span>
            <span>Building in public</span>
          </div>
          <Link className="text-link" href="/projects">
            만들고 있는 것들 <ArrowUpRight size={19} />
          </Link>
        </div>
      </div>
    </main>
  );
}
