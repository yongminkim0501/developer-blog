import { posts } from "@/lib/content";
import { PostGrid } from "@/components/post-card";

export const metadata = {
  title: "기술 블로그 정리",
  description: "다양한 서비스의 기술 블로그를 읽고 배운 내용을 모았습니다.",
};

export default function Page() {
  const reviews = posts().filter(
    (post) => post.category === "Tech Blog Review",
  );

  return (
    <main className="shell archive-page">
      <header className="page-heading">
        <span className="eyebrow">TECH BLOG NOTES</span>
        <h1>기술 블로그 정리</h1>
        <p>
          다양한 서비스의 기술과 문제 해결 과정. 기술 블로그를 읽고 배운 내용을
          모았습니다.
        </p>
      </header>
      <div className="archive-count">
        {reviews.length}개의 기록 <span>최신순</span>
      </div>
      <PostGrid items={reviews} />
    </main>
  );
}
