import Brain from "@/components/brain";
export const metadata = { title: "Ask my brain" };
export default function Page() {
  return (
    <main className="shell brain-page">
      <header className="page-heading">
        <span className="eyebrow">
          ASK MY BRAIN <span className="demo-badge">PREVIEW</span>
        </span>
        <h1>어제의 나에게 묻다.</h1>
        <p>내 개발 기록과 나누는 작은 대화.</p>
      </header>
      <Brain />
    </main>
  );
}
