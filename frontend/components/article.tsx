import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import Link from "next/link";
import { assetUrl, dateLabel, headings, postUrl } from "@/lib/content";
import type { Post } from "@/types";
import CodeBlock from "./code-block";
import ViewCount from "./view-count";
import ProjectStory from "./project-story";
import { PostGrid } from "./post-card";
export default function Article({
  post,
  related,
  previous,
  next,
}: {
  post: Post;
  related: Post[];
  previous?: Post;
  next?: Post;
}) {
  const toc = headings(post.body);
  return (
    <main className="shell article-page">
      <Link
        className="back-link"
        href={post.collection === "projects" ? "/projects" : "/blog"}
      >
        ← {post.collection === "projects" ? "프로젝트" : "모든 기록"}
      </Link>
      <header className="article-header">
        <div className="eyebrow">
          {post.category} <span>· {dateLabel(post.date)}</span>
        </div>
        <h1>{post.title}</h1>
        <p>{post.description}</p>
        <div className="article-author">
          <span className="avatar">Y</span>
          <strong>Yongmin</strong>
          <span>{post.readingTime}분 읽기</span>
          {post.collection !== "projects" && post.status === "published" && (
            <ViewCount slug={post.slug} />
          )}
          {post.demo && <span className="sample-label">샘플 콘텐츠</span>}
        </div>
      </header>
      {post.thumbnail && (
        <img
          className="article-hero"
          src={post.thumbnail}
          alt={`${post.title} 대표 이미지`}
        />
      )}
      <div
        className={`article-layout ${post.collection === "projects" ? "project-article-layout" : ""}`}
      >
        <article
          className={`prose ${post.collection === "projects" ? "project-prose" : ""}`}
        >
          {post.demo && (
            <aside className="callout">
              이 글은 화면과 콘텐츠 구조를 확인하기 위한 샘플입니다. 실제 학습
              기록과 회고로 교체할 예정입니다.
            </aside>
          )}
          <MDXRemote
            source={post.body}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  [
                    rehypePrettyCode,
                    { theme: "github-dark", keepBackground: false },
                  ],
                ],
              },
            }}
            components={{
              pre: CodeBlock,
              img: ({ src, alt, ...props }) => (
                <img
                  {...props}
                  src={
                    typeof src === "string"
                      ? assetUrl(post.collection, post.slug, src)
                      : src
                  }
                  alt={alt || ""}
                  loading="lazy"
                />
              ),
              Callout: ({ children }) => (
                <aside className="callout">{children}</aside>
              ),
              Caption: ({ children }) => (
                <div className="image-caption">{children}</div>
              ),
              ProjectStory,
            }}
          />
          <div className="article-tags">
            {post.tags.map((tag) => (
              <Link href={`/tags/${encodeURIComponent(tag)}`} key={tag}>
                #{tag}
              </Link>
            ))}
          </div>
          {post.series && (
            <p className="series-link">
              시리즈에서 이어 읽기 ·{" "}
              <Link href={`/series/${encodeURIComponent(post.series)}`}>
                {post.series} →
              </Link>
            </p>
          )}
          {post.github && (
            <p>
              <a href={post.github} target="_blank" rel="noreferrer">
                GitHub에서 코드 보기 ↗
              </a>
            </p>
          )}
        </article>
        <aside className="toc">
          <span>ON THIS PAGE</span>
          {toc.map((h) => (
            <a
              style={{ paddingLeft: h.level === 3 ? 12 : 0 }}
              href={`#${h.id}`}
              key={h.id}
            >
              {h.text}
            </a>
          ))}
        </aside>
      </div>
      <nav className="post-pagination" aria-label="이전 다음 글">
        {previous ? (
          <Link href={postUrl(previous)}>
            <small>← 이전 기록</small>
            <strong>{previous.title}</strong>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link href={postUrl(next)}>
            <small>다음 기록 →</small>
            <strong>{next.title}</strong>
          </Link>
        ) : (
          <div />
        )}
      </nav>
      {related.length > 0 && (
        <section className="section">
          <div className="section-heading">
            <h2>이어 읽으면 좋은 기록</h2>
          </div>
          <PostGrid items={related} />
        </section>
      )}
    </main>
  );
}
