import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { posts } from "@/lib/content";
import HomeHero from "@/components/home-hero";
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
      <HomeHero />
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
