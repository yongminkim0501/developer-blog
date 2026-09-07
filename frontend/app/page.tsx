import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { posts } from "@/lib/content";
import { PostGrid } from "@/components/post-card";
import {
  ExperienceList,
  AwardsList,
  ProfileProjects,
} from "@/components/profile-sections";
export default function Home() {
  const all = posts();
  return (
    <main>
      <section className="shell home-intro">
        <div className="intro-topline">
          <span className="eyebrow">
            <i className="status-dot" /> A DEVELOPER’S FIELD NOTES
          </span>
        </div>
        <h1>
          안녕하세요
          <br />
          <span>
            개발자{" "}
            <Link href="/about" className="name-highlight">
              김용민
            </Link>
            입니다.
          </span>
        </h1>
        <div className="intro-bottom">
          <p>
            코드 너머의 이유를 찾아가는 과정
            <br />
            작은 궁금증부터 직접 만든 것들까지 여기 기록합니다
          </p>
          <div className="intro-topics">
            BACKEND <span>/</span> SYSTEMS
          </div>
        </div>
      </section>
      <section className="jungle-feature">
        <div className="shell jungle-feature-inner">
          <div>
            <span className="eyebrow">LEARNING IN THE JUNGLE</span>
            <h2>
              몰입의 시간,
              <br />
              나의 정글 이야기.
            </h2>
            <p>
              알고리즘부터 운영체제까지.
              <br />
              직접 부딪히고 이해하며 쌓아가는 학습의 발자취.
            </p>
            <Link className="pill-link" href="/jungle">
              정글 기록 살펴보기 <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="jungle-art" aria-hidden="true">
            <span className="jungle-ring ring-one" />
            <span className="jungle-ring ring-two" />
            <span className="jungle-ring ring-three" />
            <div className="jungle-art-label">
              INTO
              <br />
              THE
              <br />
              <em>JUNGLE.</em>
            </div>
            <span className="jungle-coordinate">
              37° 16′ N &nbsp; 127° 02′ E
            </span>
            <span className="jungle-star">✳</span>
          </div>
        </div>
      </section>
      <section className="shell section recent-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">RECENT NOTES</span>
            <h2>차곡차곡 쌓이는 기록</h2>
          </div>
          <Link href="/blog">
            더 보기 <ArrowRight size={18} />
          </Link>
        </div>
        <PostGrid items={all.slice(0, 3)} />
      </section>
      <section className="shell section home-history">
        <div className="section-heading">
          <h2>지나온 시간과 수상</h2>
          <Link href="/about">
            소개 더 보기 <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="home-history-grid">
          <div>
            <h3>지나온 시간</h3>
            <ExperienceList />
          </div>
          <div>
            <h3>수상</h3>
            <AwardsList />
          </div>
        </div>
      </section>
      <section className="shell section home-projects">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SIDE PROJECTS</span>
            <h2>프로젝트</h2>
          </div>
        </div>
        <ProfileProjects />
      </section>
    </main>
  );
}
