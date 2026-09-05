"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="shell not-found">
      <h1>
        잠시, 페이지를
        <br />
        불러오지 못했어요.
      </h1>
      <button className="pill-link" onClick={reset}>
        다시 시도하기 →
      </button>
    </main>
  );
}
