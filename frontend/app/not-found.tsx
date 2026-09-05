import Link from "next/link";
export default function NotFound() {
  return (
    <main className="shell not-found">
      <span className="eyebrow">404 · A NOTE NOT FOUND</span>
      <h1>
        아직 쓰이지 않은
        <br />
        페이지네요.
      </h1>
      <p>주소가 바뀌었거나 공개되지 않은 기록입니다.</p>
      <Link className="pill-link" href="/blog">
        다른 기록 둘러보기 →
      </Link>
    </main>
  );
}
