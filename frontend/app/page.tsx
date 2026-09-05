import Link from "next/link";
import { ArrowRight, ArrowUpRight, ArrowDown } from "lucide-react";
import { posts } from "@/lib/content";
import { PostCard, PostGrid } from "@/components/post-card";
import ProjectStory from "@/components/project-story";
export default function Home() {
  const all = posts();
  const featured = all.filter((p) => p.featured).slice(0, 2);
  return (
    <main>
      <section className="shell home-intro">
        <div className="intro-topline">
          <span className="eyebrow">
            <i className="status-dot" /> A DEVELOPER’S FIELD NOTES
          </span>
          <span className="intro-edition">VOL. 01 — THE BEGINNING</span>
        </div>
        <h1>
          배우고, 만들고,
          <br />
          <span>조금 더 깊이 이해합니다.</span>
        </h1>
        <div className="intro-bottom">
          <p>
            코드 너머의 이유를 찾아가는 과정.
            <br />
            작은 궁금증부터 직접 만든 것들까지, 여기 기록합니다.
          </p>
          <div className="intro-topics">
            BACKEND <span>/</span> SYSTEMS <span>/</span> KRAFTON JUNGLE
          </div>
        </div>
      </section>
      <section className="shell featured-section">
        <div className="section-heading">
          <h2>
            깊이 들여다본 이야기<span className="heading-dot">.</span>
          </h2>
          <Link href="/blog">
            모든 기록 <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="featured-grid">
          {featured.map((post) => (
            <PostCard post={post} large key={post.slug} />
          ))}
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
        <PostGrid
          items={all
            .filter((p) => !featured.some((f) => f.slug === p.slug))
            .slice(0, 3)}
        />
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
      <section className="shell section home-project">
        <div className="section-heading">
          <div>
            <span className="eyebrow">IDEAS INTO REALITY</span>
            <h2>생각을 코드로 옮기는 일</h2>
          </div>
          <Link href="/projects">
            프로젝트 <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="project-intro">
          <span>PROJECT 01 / PERSONAL BLOG</span>
          <p>이 공간도, 하나의 프로젝트입니다.</p>
          <span className="scroll-hint">
            스크롤하며 살펴보기 <ArrowDown size={15} />
          </span>
        </div>
        <ProjectStory />
        <Link className="project-detail-link" href="/projects/dev-log">
          이 블로그의 설계 이야기 읽기 <ArrowUpRight size={19} />
        </Link>
      </section>
      <section className="shell brain-banner">
        <div>
          <span className="eyebrow">A CONVERSATION WITH MY NOTES</span>
          <h2>기록 속에서 답을 찾아볼까요?</h2>
          <p>내가 배우고 만든 것들에 대해 질문해보세요.</p>
        </div>
        <Link href="/brain">
          Ask my brain <ArrowUpRight size={22} />
        </Link>
      </section>
    </main>
  );
}
