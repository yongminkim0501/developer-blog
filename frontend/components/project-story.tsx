"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  Check,
  FileText,
  GitBranch,
  Globe,
  MoveRight,
} from "lucide-react";
const steps = [
  {
    label: "01 — WRITE",
    title: "생각이 사라지기 전에,\n한 편의 기록으로.",
    description:
      "에디터에서 Markdown으로 글을 쓰고, 같은 폴더에 이미지를 담아요. 기록에만 집중할 수 있도록 작성 흐름은 단순하게.",
  },
  {
    label: "02 — CONNECT",
    title: "작은 커밋 하나가\n새로운 이야기가 되도록.",
    description:
      "글과 이미지의 변경 이력을 Git으로 함께 관리해요. 커밋에서 배포까지 자연스럽게 이어지는 블로그를 설계합니다.",
  },
  {
    label: "03 — DISCOVER",
    title: "쌓인 기록에서\n다음 생각을 발견해요.",
    description:
      "주제와 시리즈로 기록을 연결하고, 검색으로 다시 찾아요. 앞으로는 내 기록에 질문하고 답을 얻는 공간으로 확장합니다.",
  },
];
export default function ProjectStory() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const sections = ref.current?.querySelectorAll<HTMLElement>("[data-step]");
    if (!sections) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting)
            setActive(Number((entry.target as HTMLElement).dataset.step));
      },
      { rootMargin: "-30% 0px -35% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
  return (
    <section
      ref={ref}
      className="project-story"
      aria-label="블로그 프로젝트 설계 과정"
    >
      <div className="story-visual">
        <div className="story-window">
          <div className="window-bar">
            <span />
            <span />
            <span />
            <small>dev.log / workspace</small>
          </div>
          <div className="story-canvas">
            <div
              className={`story-stage ${active === 0 ? "active" : ""}`}
              aria-hidden={active !== 0}
            >
              <div className="editor-sidebar">
                <FileText size={20} />
                <GitBranch size={20} />
              </div>
              <div className="editor-content">
                <small>index.mdx</small>
                <p>
                  <i>01</i>
                  <em>---</em>
                </p>
                <p>
                  <i>02</i>title: <b>&quot;오늘 이해한 것&quot;</b>
                </p>
                <p>
                  <i>03</i>status: <b>&quot;published&quot;</b>
                </p>
                <p>
                  <i>04</i>
                  <em>---</em>
                </p>
                <br />
                <h4>
                  작은 기록이 쌓이면,
                  <br />
                  나만의 지식이 된다.
                </h4>
                <div className="code-line" />
                <div className="code-line short" />
                <div className="editor-image">
                  <span>✳</span> THOUGHTS INTO WORDS
                </div>
              </div>
            </div>
            <div
              className={`story-stage pipeline ${active === 1 ? "active" : ""}`}
              aria-hidden={active !== 1}
            >
              <span className="pipeline-label">FROM LOCAL TO EVERYWHERE</span>
              <div className="pipeline-node">
                <FileText /> MDX + Images <Check size={16} />
              </div>
              <ArrowDown />
              <div className="pipeline-node">
                <GitBranch /> Git commit <Check size={16} />
              </div>
              <ArrowDown />
              <div className="pipeline-node">
                <Globe /> Build & publish <Check size={16} />
              </div>
              <small>배포 워크플로 설계</small>
            </div>
            <div
              className={`story-stage discover ${active === 2 ? "active" : ""}`}
              aria-hidden={active !== 2}
            >
              <span className="mini-brand">dev.log ✳</span>
              <h4>
                어제의 기록이,
                <br />
                내일의 힌트로.
              </h4>
              <div className="mini-search">
                ⌕ &nbsp; 내가 배운 것들 <MoveRight size={16} />
              </div>
              <div className="mini-result">
                <small>OPERATING SYSTEM</small>
                <strong>Pintos, 스케줄러를 이해하는 시간</strong>
              </div>
              <div className="mini-result">
                <small>BUILDING IN PUBLIC</small>
                <strong>나만의 기술 블로그 만들기</strong>
              </div>
            </div>
          </div>
          <div className="window-footer">
            <span className="status-dot" /> PERSONAL BLOG{" "}
            <span>DESIGN EXPLORATION</span>
          </div>
        </div>
        <div className="story-progress" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s.label} className={active === i ? "active" : ""} />
          ))}
        </div>
      </div>
      <div className="story-copy">
        {steps.map((step, i) => (
          <div className="story-step" data-step={i} key={step.label}>
            <small>{step.label}</small>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
